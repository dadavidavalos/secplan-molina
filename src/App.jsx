import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Login from './Login'
import EditarProyecto from './EditarProyecto'
import AgregarProyecto from './AgregarProyecto'
import AdminPanel from './AdminPanel'

const AZUL     = '#1B3F8B'
const AZUL_OSC = '#0F2554'
const VERDE    = '#8DC63F'

const FONDOS_COLORES = {
  'FNDR':           { bg: '#1B3F8B', label: 'FNDR' },
  'FRIL':           { bg: '#2563EB', label: 'FRIL' },
  '-5000 UTM':      { bg: '#3B82F6', label: '-5000 UTM' },
  'Circular 33':    { bg: '#0EA5E9', label: 'Circ. 33' },
  'FRPD':           { bg: '#7C3AED', label: 'FRPD' },
  'Financiamiento para Programas': { bg: '#4F46E5', label: 'Prog.' },
  'FNDR 8% (Subvenciones actividades)': { bg: '#0284C7', label: 'FNDR 8%' },
  'PMU (Mejoramiento Urbano)':    { bg: '#059669', label: 'PMU' },
  'PMB (Mejoramiento de Barrios)':{ bg: '#10B981', label: 'PMB' },
  'PTRAC (Tenencia Responsable)': { bg: '#34D399', label: 'PTRAC' },
  'PRBIPE (Revitalización de Barrios)': { bg: '#0D9488', label: 'PRBIPE' },
  'MINVU - Pavimentación Participativa': { bg: '#D97706', label: 'MINVU Pav.' },
  'MINVU - Espacios Públicos':    { bg: '#F59E0B', label: 'MINVU EP' },
  'Presupuesto Municipal':        { bg: '#8DC63F', label: 'Municipal' },
  'GORE':           { bg: '#1B3F8B', label: 'GORE' },
  'SUBDERE':        { bg: '#059669', label: 'SUBDERE' },
  'Fondos Sectoriales': { bg: '#D97706', label: 'Sectorial' },
  'Municipal (Fondos Propios)': { bg: '#8DC63F', label: 'Municipal' },
  'Otro':           { bg: '#64748B', label: 'Otro' },
  'default':        { bg: '#64748B', label: '—' },
}

const ESTADOS_COLORES = {
  'Idea':             { bg: '#F1F5F9', text: '#64748B', dot: '#94A3B8' },
  'Formulación':      { bg: '#FEF9C3', text: '#854D0E', dot: '#EAB308' },
  'Postulación':      { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6' },
  'Aprobado':         { bg: '#DCFCE7', text: '#166534', dot: '#22C55E' },
  'Licitación':       { bg: '#EDE9FE', text: '#5B21B6', dot: '#8B5CF6' },
  'Adjudicado':       { bg: '#FFEDD5', text: '#9A3412', dot: '#F97316' },
  'Finalizado':       { bg: '#E0E7FF', text: '#3730A3', dot: '#6366F1' },
  'En planificación': { bg: '#FEF9C3', text: '#854D0E', dot: '#EAB308' },
  'En licitación':    { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6' },
  'En ejecución':     { bg: '#DCFCE7', text: '#166534', dot: '#22C55E' },
  'Terminado':        { bg: '#E0E7FF', text: '#3730A3', dot: '#6366F1' },
  'Paralizado':       { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444' },
}

const PRIORIDAD_COLORES = {
  Alta:  { bg: '#EF4444', text: '#fff' },
  Media: { bg: '#F59E0B', text: '#fff' },
  Baja:  { bg: '#22C55E', text: '#fff' },
}

function getFondoColor(p) {
  return FONDOS_COLORES[p.fondo] || FONDOS_COLORES[p.financiador] || FONDOS_COLORES['default']
}

function formatFecha(str) {
  if (!str) return '—'
  try { return new Date(str).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }) }
  catch { return str }
}

function formatMonto(val, moneda) {
  if (!val) return '—'
  const n = Number(val)
  if (isNaN(n)) return val
  return moneda === 'UTM' ? `${n.toLocaleString('es-CL')} UTM` : `$${n.toLocaleString('es-CL')}`
}

const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const IconPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const IconMenu = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
)
const IconMap = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)
const IconFolder = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
  </svg>
)
const IconStar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)
const IconChart = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
)

function NavItem({ label, active, onClick, indent }) {
  return (
    <button onClick={onClick}
      className={`w-full text-left flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${indent ? 'pl-6' : ''} ${
        active ? 'text-white font-semibold' : 'text-blue-200 hover:text-white hover:bg-white/10'
      }`}
      style={active ? { background: VERDE } : {}}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${active ? 'bg-white' : 'bg-blue-400/40'}`} />
      <span className="truncate">{label}</span>
    </button>
  )
}

function FilaTabla({ p, onVerDetalle, onEditar, onEliminar }) {
  const fc = getFondoColor(p)
  const ec = ESTADOS_COLORES[p.estado] || ESTADOS_COLORES['Idea']
  const pc = p.prioridad ? (PRIORIDAD_COLORES[p.prioridad] || null) : null

  return (
    <tr className="border-b border-gray-100 hover:bg-blue-50/40 transition-colors cursor-pointer"
      onClick={() => onVerDetalle(p)}>

      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3">
          {p.imagen_url ? (
            <img src={p.imagen_url} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0 shadow-sm" />
          ) : (
            <div className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center text-base"
              style={{ background: fc.bg + '22' }}>🏗️</div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm leading-tight truncate max-w-[200px]">{p.nombre}</p>
            {p.descripcion && <p className="text-xs text-gray-400 truncate max-w-[200px] mt-0.5">{p.descripcion}</p>}
          </div>
        </div>
      </td>

      <td className="py-3.5 px-4 text-xs text-gray-500 whitespace-nowrap">{formatFecha(p.created_at)}</td>

      <td className="py-3.5 px-4">
        <div className="flex flex-col gap-0.5">
          <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-bold text-white w-fit" style={{ background: fc.bg }}>{fc.label}</span>
          {p.financiador && <span className="text-xs text-gray-400 truncate max-w-[100px]">{p.financiador}</span>}
        </div>
      </td>

      <td className="py-3.5 px-4">
        {pc
          ? <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: pc.bg, color: pc.text }}>{p.prioridad}</span>
          : <span className="text-gray-300 text-sm">—</span>}
      </td>

      <td className="py-3.5 px-4">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{ background: ec.bg, color: ec.text }}>
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: ec.dot }} />
          {p.estado || '—'}
        </span>
      </td>

      <td className="py-3.5 px-4">
        <div className="flex items-center gap-2 min-w-[110px]">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${p.avance ?? 0}%`, background: AZUL }} />
          </div>
          <span className="text-xs font-bold text-gray-700 w-8 text-right flex-shrink-0">{p.avance ?? 0}%</span>
        </div>
      </td>

      <td className="py-3.5 px-4">
        {p.ubicacion
          ? <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.ubicacion)}`}
              target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
              className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 max-w-[120px]">
              <IconMap /><span className="truncate">{p.ubicacion}</span>
            </a>
          : <span className="text-gray-300 text-xs">—</span>}
      </td>

      <td className="py-3.5 px-4 text-xs text-gray-600">
        <span className="truncate max-w-[100px] block">{p.encargado || '—'}</span>
      </td>

      <td className="py-3.5 px-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-1.5">
          {p.link_drive && (
            <a href={p.link_drive} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:opacity-80"
              style={{ background: AZUL }}>
              <IconFolder />Drive
            </a>
          )}
          <button onClick={() => onEditar(p)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 border border-blue-100 transition-all">
            Editar
          </button>
          <button onClick={() => onEliminar(p.id)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 border border-red-100 transition-all">
            Eliminar
          </button>
        </div>
      </td>
    </tr>
  )
}

export default function App() {
  const [sesion,            setSesion]            = useState(null)
  const [usuarioData,       setUsuarioData]       = useState(null)
  const [proyectos,         setProyectos]         = useState([])
  const [cargando,          setCargando]          = useState(true)
  const [filtroFinanciador, setFiltroFinanciador] = useState('Todos')
  const [filtroPrioridad,   setFiltroPrioridad]   = useState('Todas')
  const [busqueda,          setBusqueda]          = useState('')
  const [mostrarForm,       setMostrarForm]       = useState(false)
  const [mostrarAdmin,      setMostrarAdmin]      = useState(false)
  const [proyectoEditando,  setProyectoEditando]  = useState(null)
  const [proyectoDetalle,   setProyectoDetalle]   = useState(null)
  const [sidebarAbierto,    setSidebarAbierto]    = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSesion(session))
    supabase.auth.onAuthStateChange((_e, session) => setSesion(session))
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
  const prioridades   = ['Todas', 'Alta', 'Media', 'Baja']

  const proyectosFiltrados = proyectos
    .filter(p => filtroFinanciador === 'Todos' || p.financiador === filtroFinanciador)
    .filter(p => filtroPrioridad   === 'Todas' || p.prioridad   === filtroPrioridad)
    .filter(p => !busqueda || p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || p.descripcion?.toLowerCase().includes(busqueda.toLowerCase()))

  const porFondo = financiadores
    .filter(f => f !== 'Todos')
    .map(f => ({ label: f, count: proyectos.filter(p => p.financiador === f).length }))
    .filter(x => x.count > 0)

  const porPrioridad = ['Alta', 'Media', 'Baja'].map(pr => ({
    label: pr, count: proyectos.filter(p => p.prioridad === pr).length,
  }))

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#EEF2F9', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* SIDEBAR */}
      <aside className={`flex-shrink-0 flex flex-col transition-all duration-300 overflow-hidden ${sidebarAbierto ? 'w-56' : 'w-0'}`}
        style={{ background: `linear-gradient(180deg, ${AZUL_OSC} 0%, ${AZUL} 100%)` }}>
        <div className="px-4 pt-5 pb-4 border-b border-white/10">
          <img src="/imagen_transparente_molina.png" alt="Molina"
            className="h-12 object-contain w-full"
            onError={e => { e.target.style.display = 'none' }} />
          <div className="mt-3 bg-white/10 rounded-xl px-3 py-2">
            <p className="text-white text-xs font-black tracking-wide">SECPLAN</p>
            <p className="text-blue-200 text-xs">Municipalidad de Molina</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          <div>
            <p className="text-blue-300/60 text-xs font-black uppercase tracking-widest px-3 mb-2">Financiadores</p>
            {financiadores.map(f => (
              <NavItem key={f} label={f} active={filtroFinanciador === f} onClick={() => setFiltroFinanciador(f)} />
            ))}
          </div>
          <div>
            <p className="text-blue-300/60 text-xs font-black uppercase tracking-widest px-3 mb-2">Prioridad</p>
            {prioridades.map(p => (
              <NavItem key={p} label={p} active={filtroPrioridad === p} onClick={() => setFiltroPrioridad(p)} indent />
            ))}
          </div>
          {esAdmin && (
            <div>
              <p className="text-blue-300/60 text-xs font-black uppercase tracking-widest px-3 mb-2">Admin</p>
              <NavItem label="👥 Usuarios" active={mostrarAdmin} onClick={() => setMostrarAdmin(true)} />
            </div>
          )}
        </nav>
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
              style={{ background: VERDE, color: AZUL_OSC }}>
              {(usuarioData?.nombre || sesion.user.email)[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{usuarioData?.nombre || sesion.user.email}</p>
              <p className="text-blue-300 text-xs capitalize">{usuarioData?.rol || 'usuario'}</p>
            </div>
            <button onClick={() => supabase.auth.signOut()}
              className="text-blue-300 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0">
              Salir
            </button>
          </div>
        </div>
      </aside>

      {/* CONTENIDO */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* TOPBAR */}
        <header className="flex-shrink-0 px-5 py-0 flex items-center gap-4 shadow-lg"
          style={{ background: `linear-gradient(135deg, ${AZUL_OSC} 0%, ${AZUL} 100%)`, minHeight: '64px' }}>
          <button onClick={() => setSidebarAbierto(v => !v)}
            className="text-white/70 hover:text-white transition-colors p-1 flex-shrink-0">
            <IconMenu />
          </button>
          {!sidebarAbierto && (
            <img src="/imagen_transparente_molina.png" alt="Molina"
              className="h-9 object-contain flex-shrink-0"
              onError={e => { e.target.style.display = 'none' }} />
          )}
          <div className="flex-1 text-center">
            <p className="text-white font-black text-sm tracking-wide">SECPLAN — Municipalidad de Molina</p>
            <p className="text-blue-200 text-xs">Sistema de Gestión de Proyectos · Región del Maule</p>
          </div>
          <button onClick={() => setMostrarForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white flex-shrink-0 shadow-md transition-all hover:scale-[1.03] active:scale-[0.97]"
            style={{ background: VERDE }}>
            <IconPlus /><span>Nuevo proyecto</span>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-5">

          {/* KPI CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">

            {/* Total */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total de Proyectos</p>
                <p className="text-5xl font-black leading-none" style={{ color: AZUL }}>{proyectos.length}</p>
                {proyectosFiltrados.length !== proyectos.length && (
                  <p className="text-xs text-gray-400 mt-2">{proyectosFiltrados.length} en vista actual</p>
                )}
              </div>
              <div className="p-3 rounded-xl" style={{ background: AZUL + '15' }}>
                <IconChart />
              </div>
            </div>

            {/* Por Fondo */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Por Fondo</p>
                <div className="p-2 rounded-xl" style={{ background: AZUL + '15' }}><IconFolder /></div>
              </div>
              {porFondo.length === 0
                ? <p className="text-xs text-gray-300 italic">Sin datos aún</p>
                : <div className="space-y-2">
                    {porFondo.map(({ label, count }) => {
                      const col = FONDOS_COLORES[label] || FONDOS_COLORES['default']
                      const pct = proyectos.length ? Math.round(count / proyectos.length * 100) : 0
                      return (
                        <div key={label}>
                          <div className="flex items-center justify-between mb-0.5">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: col.bg }} />
                              <span className="text-xs text-gray-600 truncate max-w-[130px]">{label}</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">{count}</span>
                          </div>
                          <div className="h-1 bg-gray-100 rounded-full overflow-hidden ml-4">
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: col.bg }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
              }
            </div>

            {/* Por Prioridad */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Por Prioridad</p>
                <div className="p-2 rounded-xl" style={{ background: AZUL + '15' }}><IconStar /></div>
              </div>
              <div className="space-y-2">
                {porPrioridad.map(({ label, count }) => {
                  const col = PRIORIDAD_COLORES[label]
                  const pct = proyectos.length ? Math.round(count / proyectos.length * 100) : 0
                  return (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: col.bg }} />
                          <span className="text-xs text-gray-600">{label}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{count}</span>
                      </div>
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden ml-4">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: col.bg }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* BARRA BÚSQUEDA + FILTROS */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 mb-4 flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[180px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><IconSearch /></span>
              <input type="text" placeholder="Buscar proyectos..." value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
            </div>
            <select value={filtroFinanciador} onChange={e => setFiltroFinanciador(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 transition-all text-gray-700 cursor-pointer">
              {financiadores.map(f => <option key={f}>{f}</option>)}
            </select>
            <select value={filtroPrioridad} onChange={e => setFiltroPrioridad(e.target.value)}
              className="px-3 py-2 rounded-xl text-sm font-semibold outline-none transition-all cursor-pointer border-2"
              style={{ borderColor: AZUL, color: AZUL, background: AZUL + '08' }}>
              {prioridades.map(p => <option key={p}>{p}</option>)}
            </select>
            {(filtroFinanciador !== 'Todos' || filtroPrioridad !== 'Todas' || busqueda) && (
              <button onClick={() => { setFiltroFinanciador('Todos'); setFiltroPrioridad('Todas'); setBusqueda('') }}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all">
                ✕ Limpiar
              </button>
            )}
            <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">
              {proyectosFiltrados.length} proyecto{proyectosFiltrados.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* TABLA */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {cargando ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <div className="w-10 h-10 border-4 border-blue-100 rounded-full animate-spin" style={{ borderTopColor: AZUL }} />
                <p className="text-sm text-gray-400">Cargando proyectos...</p>
              </div>
            ) : proyectosFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                <div className="text-5xl mb-3">📂</div>
                <p className="font-semibold text-gray-500">No hay proyectos</p>
                <p className="text-sm mt-1">{busqueda ? `Sin resultados para "${busqueda}"` : 'Prueba cambiando los filtros'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[960px]">
                  <thead>
                    <tr style={{ background: `linear-gradient(135deg, ${AZUL_OSC} 0%, ${AZUL} 100%)` }}>
                      {['Proyecto', 'Fecha', 'Fondo', 'Prioridad', 'Estado', 'Progreso', 'Ubicación', 'Encargado', 'Acciones'].map(col => (
                        <th key={col} className="text-left py-3.5 px-4 text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {proyectosFiltrados.map(p => (
                      <FilaTabla key={p.id} p={p}
                        onVerDetalle={setProyectoDetalle}
                        onEditar={setProyectoEditando}
                        onEliminar={eliminarProyecto} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
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
      {mostrarAdmin && (
        <AdminPanel onCerrar={() => setMostrarAdmin(false)} />
      )}

      {/* MODAL DETALLE */}
      {proyectoDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setProyectoDetalle(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[88vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-3"
              style={{ background: `linear-gradient(135deg, ${AZUL_OSC} 0%, ${AZUL} 100%)` }}>
              <div>
                <p className="text-white font-black text-base leading-snug">{proyectoDetalle.nombre}</p>
                {proyectoDetalle.tipo_iniciativa && <p className="text-blue-200 text-xs mt-0.5">{proyectoDetalle.tipo_iniciativa}</p>}
              </div>
              <button onClick={() => setProyectoDetalle(null)} className="text-white/70 hover:text-white text-xl flex-shrink-0">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {(() => {
                const fc = getFondoColor(proyectoDetalle)
                const ec = ESTADOS_COLORES[proyectoDetalle.estado] || ESTADOS_COLORES['Idea']
                const pc = proyectoDetalle.prioridad ? PRIORIDAD_COLORES[proyectoDetalle.prioridad] : null
                return (<>
                  {proyectoDetalle.imagen_url && (
                    <img src={proyectoDetalle.imagen_url} alt={proyectoDetalle.nombre} className="w-full h-44 object-cover rounded-xl" />
                  )}
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-lg text-xs font-bold text-white" style={{ background: fc.bg }}>{fc.label}</span>
                    {proyectoDetalle.financiador && <span className="px-3 py-1 rounded-lg text-xs bg-gray-100 text-gray-600 font-semibold">{proyectoDetalle.financiador}</span>}
                    {proyectoDetalle.estado && <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: ec.bg, color: ec.text }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: ec.dot }} />{proyectoDetalle.estado}
                    </span>}
                    {pc && <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: pc.bg, color: pc.text }}>{proyectoDetalle.prioridad}</span>}
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                      <span className="font-semibold">Progreso</span>
                      <span className="font-black" style={{ color: AZUL }}>{proyectoDetalle.avance ?? 0}%</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${proyectoDetalle.avance ?? 0}%`, background: `linear-gradient(90deg, ${AZUL} 0%, ${VERDE} 100%)` }} />
                    </div>
                  </div>
                  {proyectoDetalle.descripcion && (
                    <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-3">{proyectoDetalle.descripcion}</p>
                  )}
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      ['📅 Fecha de ingreso', formatFecha(proyectoDetalle.created_at)],
                      ['👤 Encargado',        proyectoDetalle.encargado],
                      ['💰 Presupuesto',      proyectoDetalle.presupuesto ? formatMonto(proyectoDetalle.presupuesto, proyectoDetalle.moneda) : null],
                      ['💵 Monto asignado',   proyectoDetalle.asignado    ? formatMonto(proyectoDetalle.asignado,    proyectoDetalle.moneda) : null],
                      ['🗓 Inicio',           proyectoDetalle.fecha_inicio  ? formatFecha(proyectoDetalle.fecha_inicio)  : null],
                      ['🗓 Cierre',           proyectoDetalle.fecha_cierre  ? formatFecha(proyectoDetalle.fecha_cierre)  : null],
                    ].filter(([,v]) => v).map(([l, v]) => (
                      <div key={l} className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400 mb-0.5">{l}</p>
                        <p className="text-sm font-semibold text-gray-800">{v}</p>
                      </div>
                    ))}
                  </div>
                  {proyectoDetalle.ubicacion && (
                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(proyectoDetalle.ubicacion)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium bg-blue-50 rounded-xl p-3">
                      📍 {proyectoDetalle.ubicacion}
                    </a>
                  )}
                  {proyectoDetalle.link_drive && (
                    <a href={proyectoDetalle.link_drive} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white w-full hover:opacity-90 transition-all"
                      style={{ background: `linear-gradient(135deg, ${AZUL_OSC} 0%, ${AZUL} 100%)` }}>
                      <IconFolder /> Abrir carpeta en Drive
                    </a>
                  )}
                </>)
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}