import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Login from './Login'
import EditarProyecto from './EditarProyecto'
import AgregarProyecto from './AgregarProyecto'
import AdminPanel from './AdminPanel'
import DetalleProyecto from './DetalleProyecto'

// ─── Paleta institucional Molina ───────────────────────────────────────────
// Azul institucional: #1B3F8B  |  Verde lima: #8DC63F  |  Acento ámbar: #F5A623

const FONDOS_COLORES = {
  // GORE
  'FNDR':           { bg: '#1B3F8B', light: '#E8EDF7', text: '#1B3F8B', label: 'FNDR' },
  'FRIL':           { bg: '#2563EB', light: '#DBEAFE', text: '#1D4ED8', label: 'FRIL' },
  '-5000 UTM':      { bg: '#3B82F6', light: '#DBEAFE', text: '#1D4ED8', label: '-5000 UTM' },
  'Circular 33':    { bg: '#0EA5E9', light: '#E0F2FE', text: '#0369A1', label: 'Circ. 33' },
  'FRPD':           { bg: '#7C3AED', light: '#EDE9FE', text: '#6D28D9', label: 'FRPD' },
  'Financiamiento para Programas': { bg: '#4F46E5', light: '#E0E7FF', text: '#3730A3', label: 'Prog.' },
  'FNDR 8% (Subvenciones actividades)': { bg: '#0284C7', light: '#E0F2FE', text: '#0369A1', label: 'FNDR 8%' },
  // SUBDERE
  'PMU (Mejoramiento Urbano)':    { bg: '#059669', light: '#D1FAE5', text: '#047857', label: 'PMU' },
  'PMB (Mejoramiento de Barrios)':{ bg: '#10B981', light: '#D1FAE5', text: '#059669', label: 'PMB' },
  'PTRAC (Tenencia Responsable)': { bg: '#34D399', light: '#ECFDF5', text: '#059669', label: 'PTRAC' },
  'PRBIPE (Revitalización de Barrios)': { bg: '#6EE7B7', light: '#ECFDF5', text: '#047857', label: 'PRBIPE' },
  // Sectoriales
  'MINVU - Pavimentación Participativa': { bg: '#D97706', light: '#FEF3C7', text: '#B45309', label: 'MINVU Pav.' },
  'MINVU - Espacios Públicos':    { bg: '#F59E0B', light: '#FEF3C7', text: '#D97706', label: 'MINVU EP' },
  // Municipal
  'Presupuesto Municipal':        { bg: '#8DC63F', light: '#F0FDF4', text: '#3D7700', label: 'Municipal' },
  // Fallback
  'default':                      { bg: '#64748B', light: '#F1F5F9', text: '#475569', label: '—' },
}

const ESTADOS_COLORES = {
  'Idea':           { bg: '#F1F5F9', text: '#64748B', dot: '#94A3B8' },
  'Formulación':    { bg: '#FEF9C3', text: '#854D0E', dot: '#EAB308' },
  'Postulación':    { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6' },
  'Aprobado':       { bg: '#DCFCE7', text: '#166534', dot: '#22C55E' },
  'Licitación':     { bg: '#EDE9FE', text: '#5B21B6', dot: '#8B5CF6' },
  'Adjudicado':     { bg: '#FFEDD5', text: '#9A3412', dot: '#F97316' },
  'Finalizado':     { bg: '#E0E7FF', text: '#3730A3', dot: '#6366F1' },
  // Compat
  'En planificación': { bg: '#FEF9C3', text: '#854D0E', dot: '#EAB308' },
  'En licitación':    { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6' },
  'En ejecución':     { bg: '#DCFCE7', text: '#166534', dot: '#22C55E' },
  'Terminado':        { bg: '#E0E7FF', text: '#3730A3', dot: '#6366F1' },
  'Paralizado':       { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444' },
}

const PRIORIDAD_COLORES = {
  Alta:  { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444' },
  Media: { bg: '#FEF9C3', text: '#854D0E', dot: '#EAB308' },
  Baja:  { bg: '#DCFCE7', text: '#166534', dot: '#22C55E' },
}

function getFondoColor(p) {
  return FONDOS_COLORES[p.fondo] || FONDOS_COLORES[p.financiador] || FONDOS_COLORES['default']
}

function formatMonto(val, moneda) {
  if (!val) return '—'
  const n = Number(val)
  if (isNaN(n)) return val
  return moneda === 'UTM'
    ? `${n.toLocaleString('es-CL')} UTM`
    : `$${n.toLocaleString('es-CL')}`
}

// ─── Íconos SVG inline ─────────────────────────────────────────────────────
const IconGrid = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
)
const IconList = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
)
const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const IconMap = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)
const IconDrive = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 19H2l4-8h12l4 8z"/><path d="M12 3L6 13h12L12 3z"/>
  </svg>
)
const IconChevron = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)

// ─── Sidebar Nav Item ──────────────────────────────────────────────────────
function NavItem({ label, active, onClick, indent = false }) {
  return (
    <button onClick={onClick}
      className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${indent ? 'pl-5' : ''} ${
        active
          ? 'bg-[#8DC63F] text-white font-semibold shadow-sm'
          : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
      }`}>
      {active && <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />}
      {!active && <span className="w-1.5 h-1.5 rounded-full bg-slate-600 flex-shrink-0" />}
      <span className="truncate">{label}</span>
    </button>
  )
}

// ─── KPI Card ──────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, color }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full rounded-l-2xl" style={{ background: color }} />
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-black text-gray-900 leading-none">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

// ─── Badge ─────────────────────────────────────────────────────────────────
function Badge({ label, bg, text }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold"
      style={{ background: bg, color: text }}>
      {label}
    </span>
  )
}

// ─── Tarjeta cuadro ───────────────────────────────────────────────────────
function TarjetaCuadro({ p, onVerDetalle, onEditar, onEliminar }) {
  const fc = getFondoColor(p)
  const ec = ESTADOS_COLORES[p.estado] || ESTADOS_COLORES['Idea']
  const pc = p.prioridad ? (PRIORIDAD_COLORES[p.prioridad] || null) : null

  return (
    <div onClick={() => onVerDetalle(p)}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden group flex flex-col">

      {/* Imagen o placeholder con color de fondo */}
      <div className="relative h-40 flex-shrink-0 overflow-hidden"
        style={{ background: p.imagen_url ? 'transparent' : `linear-gradient(135deg, ${fc.bg}22 0%, ${fc.bg}44 100%)` }}>
        {p.imagen_url ? (
          <img src={p.imagen_url} alt={p.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center opacity-30">
              <div className="text-5xl mb-1">🏗️</div>
            </div>
          </div>
        )}
        {/* Overlay badges top */}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          <span className="px-2 py-1 rounded-lg text-xs font-bold text-white shadow-md"
            style={{ background: fc.bg }}>
            {fc.label}
          </span>
          {p.financiador && p.fondo && p.financiador !== p.fondo && (
            <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-white/90 text-gray-700 shadow-md">
              {p.financiador}
            </span>
          )}
        </div>
        {/* Prioridad top right */}
        {pc && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 rounded-lg text-xs font-bold shadow-md"
              style={{ background: pc.bg, color: pc.text }}>
              ● {p.prioridad}
            </span>
          </div>
        )}
        {/* Barra de avance bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
          <div className="h-full transition-all duration-500" style={{ width: `${p.avance ?? 0}%`, background: fc.bg }} />
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 flex-1">{p.nombre}</h3>
          <span className="text-xl font-black flex-shrink-0" style={{ color: fc.bg }}>{p.avance ?? 0}%</span>
        </div>

        {p.descripcion && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{p.descripcion}</p>
        )}

        <div className="flex items-center gap-2 flex-wrap mb-3">
          {p.estado && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{ background: ec.bg, color: ec.text }}>
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: ec.dot }} />
              {p.estado}
            </span>
          )}
          {p.tipo_iniciativa && (
            <span className="px-2 py-0.5 rounded-full text-xs text-gray-400 border border-gray-200">
              {p.tipo_iniciativa}
            </span>
          )}
        </div>

        {/* Info rápida */}
        <div className="space-y-1.5 mb-3 flex-1">
          {p.encargado && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="text-gray-400">👤</span>
              <span className="truncate">{p.encargado}</span>
            </div>
          )}
          {p.presupuesto && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="text-gray-400">💰</span>
              <span>{formatMonto(p.presupuesto, p.moneda)}</span>
            </div>
          )}
          {p.ubicacion && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="text-gray-400"><IconMap /></span>
              <span className="truncate">{p.ubicacion}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100" onClick={e => e.stopPropagation()}>
          <div className="flex gap-2">
            {p.ubicacion && (
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.ubicacion)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 transition-colors">
                <IconMap /> Mapa
              </a>
            )}
            {p.link_drive && (
              <a href={p.link_drive} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 transition-colors">
                <IconDrive /> Drive
              </a>
            )}
          </div>
          <div className="flex gap-1.5">
            <button onClick={() => onEditar(p)}
              className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-100 transition-all">
              Editar
            </button>
            <button onClick={() => onEliminar(p.id)}
              className="px-3 py-1 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg border border-red-100 transition-all">
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Fila lista ────────────────────────────────────────────────────────────
function FilaLista({ p, onVerDetalle, onEditar, onEliminar }) {
  const fc = getFondoColor(p)
  const ec = ESTADOS_COLORES[p.estado] || ESTADOS_COLORES['Idea']
  const pc = p.prioridad ? (PRIORIDAD_COLORES[p.prioridad] || null) : null

  return (
    <div onClick={() => onVerDetalle(p)}
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer flex items-center gap-4 p-4 group">

      {/* Imagen o color strip */}
      <div className="w-16 h-16 rounded-xl flex-shrink-0 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${fc.bg}33 0%, ${fc.bg}66 100%)` }}>
        {p.imagen_url ? (
          <img src={p.imagen_url} alt={p.nombre} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl opacity-50">🏗️</div>
        )}
      </div>

      {/* Nombre y desc */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="px-2 py-0.5 rounded-md text-xs font-bold text-white" style={{ background: fc.bg }}>
            {fc.label}
          </span>
          {p.financiador && p.fondo && p.financiador !== p.fondo && (
            <span className="text-xs text-gray-400">{p.financiador}</span>
          )}
        </div>
        <h3 className="font-bold text-gray-900 text-sm truncate">{p.nombre}</h3>
        {p.descripcion && (
          <p className="text-xs text-gray-400 truncate mt-0.5">{p.descripcion}</p>
        )}
      </div>

      {/* Estado */}
      <div className="flex-shrink-0 hidden sm:block">
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold"
          style={{ background: ec.bg, color: ec.text }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: ec.dot }} />
          {p.estado}
        </span>
      </div>

      {/* Avance */}
      <div className="flex-shrink-0 hidden md:flex flex-col items-center gap-1 w-20">
        <div className="flex justify-between w-full">
          <span className="text-xs text-gray-400">Avance</span>
          <span className="text-xs font-bold text-gray-700">{p.avance ?? 0}%</span>
        </div>
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${p.avance ?? 0}%`, background: fc.bg }} />
        </div>
      </div>

      {/* Prioridad */}
      {pc && (
        <div className="flex-shrink-0 hidden lg:block">
          <span className="px-2 py-1 rounded-full text-xs font-semibold"
            style={{ background: pc.bg, color: pc.text }}>
            ● {p.prioridad}
          </span>
        </div>
      )}

      {/* Encargado */}
      {p.encargado && (
        <div className="flex-shrink-0 hidden lg:block text-xs text-gray-400 max-w-[100px] truncate">
          👤 {p.encargado}
        </div>
      )}

      {/* Presupuesto */}
      {p.presupuesto && (
        <div className="flex-shrink-0 hidden xl:block text-xs text-gray-500 font-semibold">
          {formatMonto(p.presupuesto, p.moneda)}
        </div>
      )}

      {/* Acciones */}
      <div className="flex-shrink-0 flex gap-1.5" onClick={e => e.stopPropagation()}>
        {p.link_drive && (
          <a href={p.link_drive} target="_blank" rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors" title="Abrir Drive">
            <IconDrive />
          </a>
        )}
        {p.ubicacion && (
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.ubicacion)}`}
            target="_blank" rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors" title="Ver en Maps">
            <IconMap />
          </a>
        )}
        <button onClick={() => onEditar(p)}
          className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-100 transition-all">
          Editar
        </button>
        <button onClick={() => onEliminar(p.id)}
          className="px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg border border-red-100 transition-all">
          Eliminar
        </button>
      </div>
    </div>
  )
}

// ─── App principal ─────────────────────────────────────────────────────────
export default function App() {
  const [sesion, setSesion] = useState(null)
  const [usuarioData, setUsuarioData] = useState(null)
  const [proyectos, setProyectos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtroFinanciador, setFiltroFinanciador] = useState('Todos')
  const [filtroPrioridad, setFiltroPrioridad] = useState('Todas')
  const [filtroEstado, setFiltroEstado] = useState('Todos')
  const [mostrarForm, setMostrarForm] = useState(false)
  const [mostrarAdmin, setMostrarAdmin] = useState(false)
  const [proyectoEditando, setProyectoEditando] = useState(null)
  const [proyectoDetalle, setProyectoDetalle] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [vista, setVista] = useState('cuadros') // 'cuadros' | 'lista'
  const [sidebarAbierto, setSidebarAbierto] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSesion(session))
    supabase.auth.onAuthStateChange((_event, session) => setSesion(session))
  }, [])

  useEffect(() => {
    if (sesion) { cargarProyectos(); cargarUsuarioData() }
  }, [sesion])

  if (!sesion) return <Login />

  async function cargarUsuarioData() {
    const { data } = await supabase.from('Usuarios').select('*').eq('id', sesion.user.id).single()
    setUsuarioData(data)
  }

  async function cargarProyectos() {
    const { data } = await supabase.from('Proyectos').select('*').order('created_at', { ascending: false })
    setProyectos(data || [])
    setCargando(false)
  }

  async function eliminarProyecto(id) {
    if (!confirm('¿Eliminar este proyecto? Esta acción no se puede deshacer.')) return
    await supabase.from('Proyectos').delete().eq('id', id)
    cargarProyectos()
  }

  const esAdmin = usuarioData?.rol === 'admin'

  const financiadores = ['Todos', 'GORE', 'SUBDERE', 'Fondos Sectoriales', 'Municipal (Fondos Propios)', 'Otro']
  const prioridades = ['Todas', 'Alta', 'Media', 'Baja']
  const estados = ['Todos', 'Idea', 'Formulación', 'Postulación', 'Aprobado', 'Licitación', 'Adjudicado', 'Finalizado']

  const proyectosFiltrados = proyectos
    .filter(p => filtroFinanciador === 'Todos' || p.financiador === filtroFinanciador || p.fondo === filtroFinanciador)
    .filter(p => filtroPrioridad === 'Todas' || p.prioridad === filtroPrioridad)
    .filter(p => filtroEstado === 'Todos' || p.estado === filtroEstado)
    .filter(p => !busqueda || p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || p.descripcion?.toLowerCase().includes(busqueda.toLowerCase()))

  const enEjecucion = proyectos.filter(p => ['En ejecución', 'Adjudicado', 'Licitación', 'Aprobado'].includes(p.estado)).length
  const avancePromedio = proyectos.length ? Math.round(proyectos.reduce((a, p) => a + (p.avance || 0), 0) / proyectos.length) : 0
  const nFinanciadores = [...new Set(proyectos.map(p => p.financiador).filter(Boolean))].length

  return (
    <div className="flex h-screen bg-[#F4F6FB] font-sans overflow-hidden">

      {/* ─── SIDEBAR ─────────────────────────────────────────── */}
      <aside className={`flex-shrink-0 flex flex-col transition-all duration-300 ${sidebarAbierto ? 'w-60' : 'w-0 overflow-hidden'}`}
        style={{ background: 'linear-gradient(180deg, #0F2554 0%, #1B3F8B 60%, #153070 100%)' }}>

        {/* Logo Molina */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <img src="/logo-molina.png" alt="Molina" className="h-10 object-contain"
              onError={e => { e.target.style.display = 'none' }} />
          </div>
          <div className="bg-white/10 rounded-xl px-3 py-2">
            <p className="text-white font-bold text-sm leading-tight">SECPLAN</p>
            <p className="text-blue-200 text-xs">Municipalidad de Molina</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-4">

          {/* Financiadores */}
          <div>
            <p className="text-blue-300/70 text-xs font-bold uppercase tracking-widest px-3 mb-2">Financiadores</p>
            {financiadores.map(f => (
              <NavItem key={f} label={f} active={filtroFinanciador === f}
                onClick={() => setFiltroFinanciador(f)} />
            ))}
          </div>

          {/* Prioridad */}
          <div>
            <p className="text-blue-300/70 text-xs font-bold uppercase tracking-widest px-3 mb-2">Prioridad</p>
            {prioridades.map(p => (
              <NavItem key={p} label={p} active={filtroPrioridad === p}
                onClick={() => setFiltroPrioridad(p)} indent />
            ))}
          </div>

          {/* Estado */}
          <div>
            <p className="text-blue-300/70 text-xs font-bold uppercase tracking-widest px-3 mb-2">Estado</p>
            {estados.map(e => (
              <NavItem key={e} label={e} active={filtroEstado === e}
                onClick={() => setFiltroEstado(e)} indent />
            ))}
          </div>

          {/* Admin */}
          {esAdmin && (
            <div>
              <p className="text-blue-300/70 text-xs font-bold uppercase tracking-widest px-3 mb-2">Administración</p>
              <NavItem label="👥 Usuarios" active={mostrarAdmin} onClick={() => setMostrarAdmin(true)} />
            </div>
          )}
        </nav>

        {/* Usuario */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-[#1B3F8B]"
              style={{ background: '#8DC63F' }}>
              {(usuarioData?.nombre || sesion.user.email)[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{usuarioData?.nombre || sesion.user.email}</p>
              <p className="text-blue-300 text-xs capitalize">{usuarioData?.rol || 'Usuario'}</p>
            </div>
            <button onClick={() => supabase.auth.signOut()}
              className="text-blue-300 hover:text-white text-xs transition-colors px-2 py-1 rounded-lg hover:bg-white/10">
              Salir
            </button>
          </div>
        </div>
      </aside>

      {/* ─── CONTENIDO ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* HEADER */}
        <header className="bg-white border-b border-gray-100 px-6 py-3.5 flex items-center gap-4 flex-shrink-0 shadow-sm">

          {/* Toggle sidebar */}
          <button onClick={() => setSidebarAbierto(v => !v)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          {/* Título */}
          <div className="flex-shrink-0">
            <h1 className="text-base font-black text-gray-900 leading-tight">Dashboard de Proyectos</h1>
            <p className="text-xs text-gray-400">Región del Maule · {proyectosFiltrados.length} proyecto{proyectosFiltrados.length !== 1 ? 's' : ''}</p>
          </div>

          {/* Búsqueda */}
          <div className="flex-1 max-w-sm relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><IconSearch /></span>
            <input type="text" placeholder="Buscar proyecto..." value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1B3F8B] focus:ring-2 focus:ring-[#1B3F8B]/10 transition-all" />
          </div>

          {/* Filtros rápidos prioridad */}
          <div className="hidden lg:flex gap-1.5">
            {prioridades.map(p => {
              const col = p !== 'Todas' ? PRIORIDAD_COLORES[p] : null
              return (
                <button key={p} onClick={() => setFiltroPrioridad(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    filtroPrioridad === p ? 'border-transparent shadow-sm' : 'border-gray-200 text-gray-500 bg-white hover:border-gray-300'
                  }`}
                  style={filtroPrioridad === p && col ? { background: col.bg, color: col.text, borderColor: 'transparent' }
                    : filtroPrioridad === p ? { background: '#1B3F8B', color: 'white' } : {}}>
                  {p !== 'Todas' && '● '}{p}
                </button>
              )
            })}
          </div>

          {/* Toggle vista */}
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1 flex-shrink-0">
            <button onClick={() => setVista('cuadros')}
              className={`p-2 rounded-lg transition-all ${vista === 'cuadros' ? 'bg-white shadow-sm text-[#1B3F8B]' : 'text-gray-400 hover:text-gray-600'}`}>
              <IconGrid />
            </button>
            <button onClick={() => setVista('lista')}
              className={`p-2 rounded-lg transition-all ${vista === 'lista' ? 'bg-white shadow-sm text-[#1B3F8B]' : 'text-gray-400 hover:text-gray-600'}`}>
              <IconList />
            </button>
          </div>

          {/* Nuevo proyecto */}
          <button onClick={() => setMostrarForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white flex-shrink-0 shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #1B3F8B 0%, #2563EB 100%)' }}>
            <IconPlus />
            <span className="hidden sm:inline">Nuevo proyecto</span>
          </button>
        </header>

        {/* MAIN */}
        <main className="flex-1 overflow-y-auto p-6">

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard label="Total proyectos" value={proyectos.length} color="#1B3F8B"
              sub={`${proyectosFiltrados.length} en vista actual`} />
            <KpiCard label="En ejecución" value={enEjecucion} color="#8DC63F"
              sub={`${proyectos.length ? Math.round(enEjecucion/proyectos.length*100) : 0}% del total`} />
            <KpiCard label="Avance promedio" value={`${avancePromedio}%`} color="#F5A623"
              sub="Todos los proyectos" />
            <KpiCard label="Financiadores activos" value={nFinanciadores} color="#6366F1"
              sub="Organismos distintos" />
          </div>

          {/* Filtros estado inline */}
          <div className="flex gap-2 mb-5 flex-wrap items-center">
            <span className="text-xs text-gray-400 font-semibold mr-1">Estado:</span>
            {estados.map(e => {
              const ec = e !== 'Todos' ? (ESTADOS_COLORES[e] || null) : null
              return (
                <button key={e} onClick={() => setFiltroEstado(e)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    filtroEstado === e ? 'border-transparent shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                  style={filtroEstado === e && ec ? { background: ec.bg, color: ec.text } :
                    filtroEstado === e ? { background: '#1B3F8B', color: 'white' } : {}}>
                  {e !== 'Todos' && <span className="mr-1 inline-block w-1.5 h-1.5 rounded-full align-middle"
                    style={{ background: ec?.dot || '#94A3B8' }} />}
                  {e}
                </button>
              )
            })}
            {(filtroFinanciador !== 'Todos' || filtroPrioridad !== 'Todas' || filtroEstado !== 'Todos' || busqueda) && (
              <button onClick={() => { setFiltroFinanciador('Todos'); setFiltroPrioridad('Todas'); setFiltroEstado('Todos'); setBusqueda('') }}
                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all ml-auto">
                ✕ Limpiar filtros
              </button>
            )}
          </div>

          {/* Resultado búsqueda */}
          {busqueda && (
            <p className="text-xs text-gray-400 mb-3">
              {proyectosFiltrados.length} resultado{proyectosFiltrados.length !== 1 ? 's' : ''} para "<strong>{busqueda}</strong>"
            </p>
          )}

          {/* PROYECTOS */}
          {cargando ? (
            <div className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-[#1B3F8B]/20 border-t-[#1B3F8B] rounded-full animate-spin" />
                <p className="text-sm text-gray-400">Cargando proyectos...</p>
              </div>
            </div>
          ) : proyectosFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <div className="text-6xl mb-4">📂</div>
              <p className="font-semibold text-gray-500">No hay proyectos</p>
              <p className="text-sm mt-1">{busqueda ? `No hay resultados para "${busqueda}"` : 'Prueba cambiando los filtros'}</p>
            </div>
          ) : vista === 'cuadros' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
              {proyectosFiltrados.map(p => (
                <TarjetaCuadro key={p.id} p={p}
                  onVerDetalle={setProyectoDetalle}
                  onEditar={setProyectoEditando}
                  onEliminar={eliminarProyecto} />
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              {proyectosFiltrados.map(p => (
                <FilaLista key={p.id} p={p}
                  onVerDetalle={setProyectoDetalle}
                  onEditar={setProyectoEditando}
                  onEliminar={eliminarProyecto} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* MODALES */}
      {mostrarForm && (
        <AgregarProyecto
          onClose={() => setMostrarForm(false)}
          onGuardado={() => { cargarProyectos(); setMostrarForm(false) }}
        />
      )}
      {proyectoEditando && (
        <EditarProyecto
          proyecto={proyectoEditando}
          usuario={sesion.user.email}
          onGuardado={() => { setProyectoEditando(null); cargarProyectos() }}
          onCerrar={() => setProyectoEditando(null)}
        />
      )}
      {proyectoDetalle && (
        <DetalleProyecto
          proyecto={proyectoDetalle}
          onCerrar={() => setProyectoDetalle(null)}
        />
      )}
      {mostrarAdmin && (
        <AdminPanel onCerrar={() => setMostrarAdmin(false)} />
      )}
    </div>
  )
}