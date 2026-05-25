import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabase'
import Login from './Login'
import EditarProyecto from './EditarProyecto'
import AgregarProyecto from './AgregarProyecto'
import AdminPanel from './AdminPanel'

// ─── Colores ───────────────────────────────────────────────────────────────
const AZUL     = '#1B3F8B'
const AZUL_OSC = '#0F2554'
const VERDE    = '#8DC63F'

// Fondos grandes (financiadores)
const FONDOS_GRANDES = ['GORE', 'SUBDERE', 'Fondos Sectoriales', 'Municipal (Fondos Propios)', 'Otro']

// Tipos de fondo por financiador
const TIPOS_POR_FONDO = {
  'GORE':                    ['FNDR', 'FRIL', '-5000 UTM', 'Circular 33', 'FNDR 8% (Subvenciones actividades)', 'Financiamiento para Programas', 'FRPD'],
  'SUBDERE':                 ['PMU (Mejoramiento Urbano)', 'PMB (Mejoramiento de Barrios)', 'PTRAC (Tenencia Responsable)', 'PRBIPE (Revitalización de Barrios)'],
  'Fondos Sectoriales':      ['MINVU - Pavimentación Participativa', 'MINVU - Espacios Públicos'],
  'Municipal (Fondos Propios)': ['Presupuesto Municipal'],
  'Otro':                    ['Otro'],
}

const FONDOS_COLORES = {
  'FNDR':           { bg: '#1B3F8B', label: 'FNDR' },
  'FRIL':           { bg: '#2563EB', label: 'FRIL' },
  '-5000 UTM':      { bg: '#3B82F6', label: '-5000 UTM' },
  'Circular 33':    { bg: '#0EA5E9', label: 'Circ. 33' },
  'FRPD':           { bg: '#7C3AED', label: 'FRPD' },
  'Financiamiento para Programas': { bg: '#4F46E5', label: 'Prog.' },
  'FNDR 8% (Subvenciones actividades)': { bg: '#0284C7', label: 'FNDR 8%' },
  'PMU (Mejoramiento Urbano)':     { bg: '#059669', label: 'PMU' },
  'PMB (Mejoramiento de Barrios)': { bg: '#10B981', label: 'PMB' },
  'PTRAC (Tenencia Responsable)':  { bg: '#34D399', label: 'PTRAC' },
  'PRBIPE (Revitalización de Barrios)': { bg: '#0D9488', label: 'PRBIPE' },
  'MINVU - Pavimentación Participativa': { bg: '#D97706', label: 'MINVU Pav.' },
  'MINVU - Espacios Públicos':     { bg: '#F59E0B', label: 'MINVU EP' },
  'Presupuesto Municipal':         { bg: '#8DC63F', label: 'Municipal' },
  'GORE':                          { bg: '#1B3F8B', label: 'GORE' },
  'SUBDERE':                       { bg: '#059669', label: 'SUBDERE' },
  'Fondos Sectoriales':            { bg: '#D97706', label: 'Sectorial' },
  'Municipal (Fondos Propios)':    { bg: '#8DC63F', label: 'Municipal' },
  'Otro':                          { bg: '#64748B', label: 'Otro' },
  'default':                       { bg: '#64748B', label: '—' },
}

// Colores para KPI de fondos grandes
const FONDOS_GRANDES_COLORES = {
  'GORE':                    '#1B3F8B',
  'SUBDERE':                 '#059669',
  'Fondos Sectoriales':      '#D97706',
  'Municipal (Fondos Propios)': '#8DC63F',
  'Otro':                    '#64748B',
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

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
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

// ─── Icons ────────────────────────────────────────────────────────────────
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
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
  </svg>
)
const IconStar = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)
const IconChart = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
)
const IconDownload = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
)
const IconLayers = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
    <polyline points="2 17 12 22 22 17"/>
    <polyline points="2 12 12 17 22 12"/>
  </svg>
)

// ─── Nav item sidebar ─────────────────────────────────────────────────────
function NavItem({ label, active, onClick, indent, dot, expanded, hasChildren, onToggle }) {
  return (
    <button onClick={hasChildren ? onToggle : onClick}
      className={`w-full text-left flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${indent ? 'pl-5' : ''}`}
      style={active ? { background: '#111827', color: 'white', fontWeight: 600 } : { color: '#6B7280' }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.color = '#111827' }}}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6B7280' }}}>
      {dot && (
        <span className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: active ? 'white' : (FONDOS_GRANDES_COLORES[label] || PRIORIDAD_COLORES[label]?.bg || '#D1D5DB') }} />
      )}
      {!dot && (
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: active ? 'white' : '#D1D5DB' }} />
      )}
      <span className="flex-1 truncate">{label}</span>
      {hasChildren && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .2s', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      )}
    </button>
  )
}

// ─── KPI card genérico ────────────────────────────────────────────────────
function KpiCard({ icon, label, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <div className="p-2 rounded-xl" style={{ background: '#F3F4F6' }}>{icon}</div>
      </div>
      {children}
    </div>
  )
}

// ─── Mini barra KPI ───────────────────────────────────────────────────────
function KpiRow({ label, count, total, color }) {
  const pct = total > 0 ? Math.round(count / total * 100) : 0
  return (
    <div className="mb-2">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
          <span className="text-xs text-gray-600 truncate max-w-[130px]">{label}</span>
        </div>
        <span className="text-sm font-bold text-gray-900">{count}</span>
      </div>
      <div className="h-1 bg-gray-100 rounded-full overflow-hidden ml-4">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

// ─── Fila de tabla ────────────────────────────────────────────────────────
function FilaTabla({ p, onVerDetalle, onEditar, onEliminar }) {
  const fc = getFondoColor(p)
  const ec = ESTADOS_COLORES[p.estado] || ESTADOS_COLORES['Idea']
  const pc = p.prioridad ? (PRIORIDAD_COLORES[p.prioridad] || null) : null

  return (
    <tr className="border-b border-gray-100 cursor-pointer"
      style={{ transition: 'background .12s' }}
      onMouseEnter={e => e.currentTarget.style.background = '#F8FAFF'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      onClick={() => onVerDetalle(p)}>

      {/* Proyecto */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          {p.imagen_url
            ? <img src={p.imagen_url} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} />
            : <div className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center text-base" style={{ background: fc.bg + '22' }}>🏗️</div>
          }
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm leading-tight" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nombre}</p>
            {p.descripcion && <p className="text-xs text-gray-400 mt-0.5" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.descripcion}</p>}
          </div>
        </div>
      </td>

      {/* Fecha */}
      <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{formatFecha(p.created_at)}</td>

      {/* Fondo */}
      <td className="py-3 px-4">
        <div className="flex flex-col gap-0.5">
          <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-bold text-white w-fit" style={{ background: fc.bg }}>{fc.label}</span>
          {p.financiador && <span className="text-xs text-gray-400" style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.financiador}</span>}
        </div>
      </td>

      {/* Prioridad */}
      <td className="py-3 px-4">
        {pc
          ? <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: pc.bg, color: pc.text }}>{p.prioridad}</span>
          : <span className="text-gray-300">—</span>}
      </td>

      {/* Estado */}
      <td className="py-3 px-4">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: ec.bg, color: ec.text }}>
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: ec.dot }} />
          {p.estado || '—'}
        </span>
      </td>

      {/* Progreso */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-2" style={{ minWidth: 100 }}>
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${p.avance ?? 0}%`, background: '#111827' }} />
          </div>
          <span className="text-xs font-bold text-gray-800 w-8 text-right flex-shrink-0">{p.avance ?? 0}%</span>
        </div>
      </td>

      {/* Ubicación */}
      <td className="py-3 px-4">
        {p.ubicacion
          ? <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.ubicacion)}`}
              target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1 text-xs font-medium transition-colors"
              style={{ color: AZUL, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <IconMap />{p.ubicacion}
            </a>
          : <span className="text-gray-300 text-xs">—</span>}
      </td>

      {/* Encargado */}
      <td className="py-3 px-4 text-xs text-gray-600">
        <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
          {p.encargado || '—'}
        </span>
      </td>

      {/* Acciones */}
      <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-1.5">
          {p.link_drive && (
            <a href={p.link_drive} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:opacity-80"
              style={{ background: '#111827' }}>
              <IconFolder />Drive
            </a>
          )}
          <button onClick={() => onEditar(p)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ color: '#374151', border: '1px solid #E5E7EB', background: 'white' }}
            onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
            onMouseLeave={e => e.currentTarget.style.background = 'white'}>
            Editar
          </button>
          <button onClick={() => onEliminar(p.id)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ color: '#EF4444', border: '1px solid #FEE2E2', background: 'white' }}
            onMouseEnter={e => e.currentTarget.style.background = '#FFF5F5'}
            onMouseLeave={e => e.currentTarget.style.background = 'white'}>
            Eliminar
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [sesion,           setSesion]           = useState(null)
  const [usuarioData,      setUsuarioData]      = useState(null)
  const [proyectos,        setProyectos]        = useState([])
  const [cargando,         setCargando]         = useState(true)
  const [filtroFondo,      setFiltroFondo]      = useState('Todos')
  const [filtroTipo,       setFiltroTipo]       = useState('Todos')
  const [filtroPrioridad,  setFiltroPrioridad]  = useState('Todas')
  const [busqueda,         setBusqueda]         = useState('')
  const [mostrarForm,      setMostrarForm]      = useState(false)
  const [mostrarAdmin,     setMostrarAdmin]     = useState(false)
  const [proyectoEditando, setProyectoEditando] = useState(null)
  const [proyectoDetalle,  setProyectoDetalle]  = useState(null)
  const [sidebarAbierto,   setSidebarAbierto]   = useState(true)
  const [menuExportar,        setMenuExportar]        = useState(false)
  const [mostrarResetPassword, setMostrarResetPassword] = useState(false)

  useEffect(() => {
    if (!menuExportar) return
    const handler = () => setMenuExportar(false)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [menuExportar])

  useEffect(() => {
    // Si la URL tiene token de recovery, mostrar formulario reset
    const hash = window.location.hash
    if (hash.includes('type=recovery') || hash.includes('error_code=otp')) {
      setMostrarResetPassword(true)
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      // Si hay sesión pero venimos de recovery, no mostrar dashboard
      if (hash.includes('type=recovery')) {
        setSesion(null)
        setMostrarResetPassword(true)
      } else {
        setSesion(session)
      }
    })
    supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSesion(null)
        setMostrarResetPassword(true)
      } else if (event === 'SIGNED_IN' && window.location.hash.includes('type=recovery')) {
        setSesion(null)
        setMostrarResetPassword(true)
      } else {
        setSesion(s)
      }
    })
  }, [])

  useEffect(() => {
    if (sesion) { cargarProyectos(); cargarUsuarioData() }
  }, [sesion])

  if (!sesion) return <Login mostrarReset={mostrarResetPassword} onResetDone={() => setMostrarResetPassword(false)} />

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

  // ─── Exportar Excel ──────────────────────────────────────────────────────
  async function exportarExcel() {
    const XLSX = await import('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm')
    const fecha = new Date().toLocaleDateString('es-CL')

    // Orden de financiadores y tipos dentro de cada uno
    const ORDEN_FINANCIADORES = ['GORE', 'SUBDERE', 'Fondos Sectoriales', 'Municipal (Fondos Propios)', 'Otro']
    const ORDEN_TIPOS = {
      'GORE':                 ['FNDR', 'FRIL', '-5000 UTM', 'Circular 33', 'FNDR 8% (Subvenciones actividades)', 'Financiamiento para Programas', 'FRPD'],
      'SUBDERE':              ['PMU (Mejoramiento Urbano)', 'PMB (Mejoramiento de Barrios)', 'PTRAC (Tenencia Responsable)', 'PRBIPE (Revitalización de Barrios)'],
      'Fondos Sectoriales':   ['MINVU - Pavimentación Participativa', 'MINVU - Espacios Públicos'],
      'Municipal (Fondos Propios)': ['Presupuesto Municipal'],
      'Otro':                 [],
    }

    // Ordenar proyectos: primero por financiador, luego por tipo de fondo
    const proyectosOrdenados = [...proyectosFiltrados].sort((a, b) => {
      const fi = ORDEN_FINANCIADORES.indexOf(a.financiador ?? 'Otro')
      const fj = ORDEN_FINANCIADORES.indexOf(b.financiador ?? 'Otro')
      if (fi !== fj) return fi - fj
      const tipos = ORDEN_TIPOS[a.financiador] || []
      const ti = tipos.indexOf(a.fondo ?? '')
      const tj = tipos.indexOf(b.fondo ?? '')
      if (ti === -1 && tj === -1) return 0
      if (ti === -1) return 1
      if (tj === -1) return -1
      return ti - tj
    })

    const filas = proyectosOrdenados.map((p, i) => ({
      'N°':             i + 1,
      'Proyecto':       p.nombre || '—',
      'Descripción':    p.descripcion || '—',
      'Financiador':    p.financiador || '—',
      'Fondo':          p.financiador === 'Otro' ? (p.fondo || '—') : (p.fondo || '—'),
      'Estado':         p.estado || '—',
      'Prioridad':      p.prioridad || '—',
      'Avance (%)':     p.avance ?? 0,
      'Encargado':      p.encargado || '—',
      'Ubicación':      p.ubicacion || '—',
      'Fecha ingreso':  p.created_at ? new Date(p.created_at).toLocaleDateString('es-CL') : '—',
      'Fecha inicio':   p.fecha_inicio || '—',
      'Fecha cierre':   p.fecha_cierre || '—',
      'Presupuesto':    p.presupuesto ? `${p.presupuesto} ${p.moneda || ''}` : '—',
      'Monto asignado': p.asignado ? `${p.asignado} ${p.moneda || ''}` : '—',
      'Link Drive':     p.link_drive || '—',
    }))

    const wb = XLSX.utils.book_new()

    // Hoja 1: Proyectos ordenados
    const ws = XLSX.utils.json_to_sheet(filas)
    ws['!cols'] = [
      { wch: 4 }, { wch: 30 }, { wch: 35 }, { wch: 22 }, { wch: 30 },
      { wch: 18 }, { wch: 10 }, { wch: 10 }, { wch: 18 }, { wch: 28 },
      { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 18 }, { wch: 18 }, { wch: 35 },
    ]
    XLSX.utils.book_append_sheet(wb, ws, 'Proyectos')

    // Hoja 2: Resumen igual que los KPIs de la página
    const totalProyectos = proyectosFiltrados.length
    const avanceProm = totalProyectos > 0
      ? Math.round(proyectosFiltrados.reduce((s, p) => s + (p.avance || 0), 0) / totalProyectos)
      : 0

    const resumen = [
      ['SECPLAN — Cartera de Proyectos', '', ''],
      ['Municipalidad de Molina', '', ''],
      [`Fecha exportación: ${fecha}`, '', ''],
      ['', '', ''],
      ['TOTAL DE PROYECTOS', totalProyectos, ''],
      [`Avance promedio: ${avanceProm}%`, '', ''],
      ['', '', ''],
      ['POR FONDO (Financiador)', 'Cantidad', '% del total'],
      ...FONDOS_GRANDES.map(f => {
        const cnt = proyectosFiltrados.filter(p => p.financiador === f).length
        return [f, cnt, totalProyectos > 0 ? Math.round(cnt / totalProyectos * 100) + '%' : '0%']
      }).filter(([, c]) => c > 0),
      ['', '', ''],
      ['POR PRIORIDAD', 'Cantidad', '% del total'],
      ...['Alta', 'Media', 'Baja'].map(pr => {
        const cnt = proyectosFiltrados.filter(p => p.prioridad === pr).length
        return [pr, cnt, totalProyectos > 0 ? Math.round(cnt / totalProyectos * 100) + '%' : '0%']
      }),
      ['', '', ''],
      ['POR ESTADO', 'Cantidad', '% del total'],
      ...Object.keys(ESTADOS_COLORES).map(e => {
        const cnt = proyectosFiltrados.filter(p => p.estado === e).length
        return [e, cnt, totalProyectos > 0 ? Math.round(cnt / totalProyectos * 100) + '%' : '0%']
      }).filter(([, c]) => c > 0),
    ]
    const ws2 = XLSX.utils.aoa_to_sheet(resumen)
    ws2['!cols'] = [{ wch: 32 }, { wch: 12 }, { wch: 14 }]
    XLSX.utils.book_append_sheet(wb, ws2, 'Resumen')

    XLSX.writeFile(wb, `SECPLAN_Cartera_${fecha.replace(/\//g, '-')}.xlsx`)
  }

  // ─── Exportar PDF ────────────────────────────────────────────────────────
  async function exportarPDF() {
    if (!window.jspdf) {
      await new Promise((res, rej) => {
        const s = document.createElement('script')
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
        s.onload = res; s.onerror = rej
        document.head.appendChild(s)
      })
    }
    if (!window.jspdf?.jsPDF?.prototype?.autoTable) {
      await new Promise((res, rej) => {
        const s = document.createElement('script')
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js'
        s.onload = res; s.onerror = rej
        document.head.appendChild(s)
      })
    }
    const { jsPDF } = window.jspdf
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    const fecha = new Date().toLocaleDateString('es-CL')
    const azul = [27, 63, 139]
    const W = doc.internal.pageSize.getWidth()
    const H = doc.internal.pageSize.getHeight()

    // Orden igual que exportarExcel
    const ORDEN_FINANCIADORES = ['GORE', 'SUBDERE', 'Fondos Sectoriales', 'Municipal (Fondos Propios)', 'Otro']
    const ORDEN_TIPOS = {
      'GORE':                 ['FNDR', 'FRIL', '-5000 UTM', 'Circular 33', 'FNDR 8% (Subvenciones actividades)', 'Financiamiento para Programas', 'FRPD'],
      'SUBDERE':              ['PMU (Mejoramiento Urbano)', 'PMB (Mejoramiento de Barrios)', 'PTRAC (Tenencia Responsable)', 'PRBIPE (Revitalización de Barrios)'],
      'Fondos Sectoriales':   ['MINVU - Pavimentación Participativa', 'MINVU - Espacios Públicos'],
      'Municipal (Fondos Propios)': ['Presupuesto Municipal'],
      'Otro':                 [],
    }
    const proyectosOrdenados = [...proyectosFiltrados].sort((a, b) => {
      const fi = ORDEN_FINANCIADORES.indexOf(a.financiador ?? 'Otro')
      const fj = ORDEN_FINANCIADORES.indexOf(b.financiador ?? 'Otro')
      if (fi !== fj) return fi - fj
      const tipos = ORDEN_TIPOS[a.financiador] || []
      const ti = tipos.indexOf(a.fondo ?? '')
      const tj = tipos.indexOf(b.fondo ?? '')
      if (ti === -1 && tj === -1) return 0
      if (ti === -1) return 1
      if (tj === -1) return -1
      return ti - tj
    })

    // ── Header ──
    doc.setFillColor(...azul)
    doc.rect(0, 0, W, 22, 'F')
    doc.setFontSize(16); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255)
    doc.text('SECPLAN', 14, 10)
    doc.setFontSize(8); doc.setFont('helvetica', 'normal')
    doc.text('Municipalidad de Molina · Región del Maule', 14, 16)
    doc.setFontSize(10); doc.setFont('helvetica', 'bold')
    doc.text('Cartera de Proyectos', W / 2, 13, { align: 'center' })
    doc.setFontSize(8); doc.setFont('helvetica', 'normal')
    doc.text(`Generado: ${fecha}`, W - 14, 10, { align: 'right' })
    doc.text(`Total: ${proyectosFiltrados.length} proyectos`, W - 14, 16, { align: 'right' })

    // ── KPIs — mismos 3 bloques que la página ──
    // Bloque 1: Total de proyectos
    const totalProyectos = proyectosFiltrados.length
    const avanceProm = totalProyectos > 0
      ? Math.round(proyectosFiltrados.reduce((s, p) => s + (p.avance || 0), 0) / totalProyectos)
      : 0

    let kpiY = 26
    const kpiH = 28
    const col1W = 42
    const col2W = 80
    const col3W = 80
    const gap = 4

    // — KPI 1: Total —
    doc.setFillColor(245, 247, 252)
    doc.roundedRect(14, kpiY, col1W, kpiH, 2, 2, 'F')
    doc.setFontSize(7); doc.setFont('helvetica', 'bold'); doc.setTextColor(100, 100, 100)
    doc.text('TOTAL DE PROYECTOS', 14 + col1W / 2, kpiY + 6, { align: 'center' })
    doc.setFontSize(26); doc.setFont('helvetica', 'bold'); doc.setTextColor(...azul)
    doc.text(String(totalProyectos), 14 + col1W / 2, kpiY + 18, { align: 'center' })
    doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 100, 100)
    doc.text(`Avance prom. ${avanceProm}%`, 14 + col1W / 2, kpiY + 25, { align: 'center' })

    // Barra de avance prom dentro del KPI total
    const barX = 14 + 6; const barW = col1W - 12; const barY = kpiY + 27
    doc.setFillColor(220, 220, 220); doc.rect(barX, barY, barW, 2, 'F')
    doc.setFillColor(...azul); doc.rect(barX, barY, barW * avanceProm / 100, 2, 'F')

    // — KPI 2: Por Fondo —
    const x2 = 14 + col1W + gap
    doc.setFillColor(245, 247, 252)
    doc.roundedRect(x2, kpiY, col2W, kpiH, 2, 2, 'F')
    doc.setFontSize(7); doc.setFont('helvetica', 'bold'); doc.setTextColor(100, 100, 100)
    doc.text('POR FONDO', x2 + 6, kpiY + 6)
    const fondosKpi = FONDOS_GRANDES
      .map(f => ({ label: f, count: proyectosFiltrados.filter(p => p.financiador === f).length, color: FONDOS_GRANDES_COLORES[f] }))
      .filter(x => x.count > 0)
    fondosKpi.forEach(({ label, count, color }, idx) => {
      const fy = kpiY + 10 + idx * 5
      if (fy + 4 > kpiY + kpiH) return
      // dot color
      const rgb = hexToRgb(color)
      doc.setFillColor(...rgb); doc.circle(x2 + 8, fy + 1, 1.2, 'F')
      doc.setFontSize(6.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(60, 60, 60)
      doc.text(label, x2 + 12, fy + 2)
      doc.setFont('helvetica', 'bold'); doc.setTextColor(...azul)
      doc.text(String(count), x2 + col2W - 8, fy + 2, { align: 'right' })
      // mini barra
      const bw = col2W - 30
      doc.setFillColor(220, 220, 220); doc.rect(x2 + 12, fy + 3, bw, 1, 'F')
      doc.setFillColor(...rgb); doc.rect(x2 + 12, fy + 3, bw * count / (totalProyectos || 1), 1, 'F')
    })

    // — KPI 3: Por Prioridad —
    const x3 = x2 + col2W + gap
    doc.setFillColor(245, 247, 252)
    doc.roundedRect(x3, kpiY, col3W, kpiH, 2, 2, 'F')
    doc.setFontSize(7); doc.setFont('helvetica', 'bold'); doc.setTextColor(100, 100, 100)
    doc.text('POR PRIORIDAD', x3 + 6, kpiY + 6)
    const prioColors = { Alta: [239, 68, 68], Media: [245, 158, 11], Baja: [34, 197, 94] }
    ;['Alta', 'Media', 'Baja'].forEach((pr, idx) => {
      const cnt = proyectosFiltrados.filter(p => p.prioridad === pr).length
      const fy = kpiY + 10 + idx * 6
      const rgb = prioColors[pr]
      doc.setFillColor(...rgb); doc.circle(x3 + 8, fy + 1, 1.2, 'F')
      doc.setFontSize(6.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(60, 60, 60)
      doc.text(pr, x3 + 12, fy + 2)
      doc.setFont('helvetica', 'bold'); doc.setTextColor(...azul)
      doc.text(String(cnt), x3 + col3W - 8, fy + 2, { align: 'right' })
      const bw = col3W - 30
      doc.setFillColor(220, 220, 220); doc.rect(x3 + 12, fy + 3, bw, 1, 'F')
      doc.setFillColor(...rgb); doc.rect(x3 + 12, fy + 3, bw * cnt / (totalProyectos || 1), 1, 'F')
    })

    // ── Tabla ──
    const cols = ['N°', 'Proyecto', 'Financiador', 'Fondo / Tipo', 'Estado', 'Prioridad', 'Avance', 'Encargado', 'Ubicación']
    const rows = proyectosOrdenados.map((p, i) => [
      i + 1,
      p.nombre || '—',
      p.financiador || '—',
      p.financiador === 'Otro' ? (p.fondo || '—') : (p.fondo || '—'),
      p.estado || '—',
      p.prioridad || '—',
      `${p.avance ?? 0}%`,
      p.encargado || '—',
      p.ubicacion ? p.ubicacion.substring(0, 24) : '—',
    ])

    doc.autoTable({
      head: [cols],
      body: rows,
      startY: kpiY + kpiH + 4,
      margin: { left: 14, right: 14 },
      styles: { fontSize: 7.5, cellPadding: 2.2, overflow: 'ellipsize' },
      headStyles: { fillColor: azul, textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
      alternateRowStyles: { fillColor: [245, 248, 252] },
      columnStyles: {
        0: { cellWidth: 8 },
        1: { cellWidth: 44 },
        2: { cellWidth: 26 },
        3: { cellWidth: 28 },
        4: { cellWidth: 25 },
        5: { cellWidth: 17 },
        6: { cellWidth: 13 },
        7: { cellWidth: 22 },
        8: { cellWidth: 'auto' },
      },
    })

    // ── Footer en cada página ──
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFillColor(...azul)
      doc.rect(0, H - 8, W, 8, 'F')
      doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(255, 255, 255)
      doc.text('SECPLAN — Municipalidad de Molina', 14, H - 3)
      doc.text(`Página ${i} de ${pageCount}`, W - 14, H - 3, { align: 'right' })
    }

    doc.save(`SECPLAN_Cartera_${fecha.replace(/\//g, '-')}.pdf`)
  }

  const esAdmin = usuarioData?.rol === 'admin'
  const prioridades = ['Todas', 'Alta', 'Media', 'Baja']

  // Tipos de fondo disponibles según fondo seleccionado
  const tiposDisponibles = filtroFondo === 'Todos'
    ? Object.values(TIPOS_POR_FONDO).flat()
    : (TIPOS_POR_FONDO[filtroFondo] || [])

  // Al cambiar fondo, resetear tipo
  function cambiarFondo(f) {
    setFiltroFondo(f)
    setFiltroTipo('Todos')
  }

  const proyectosFiltrados = proyectos
    .filter(p => filtroFondo === 'Todos' || p.financiador === filtroFondo)
    .filter(p => filtroTipo  === 'Todos' || p.fondo       === filtroTipo)
    .filter(p => filtroPrioridad === 'Todas' || p.prioridad === filtroPrioridad)
    .filter(p => !busqueda || p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || p.descripcion?.toLowerCase().includes(busqueda.toLowerCase()))

  // KPI: por fondo grande
  const kpiFondo = FONDOS_GRANDES.map(f => ({
    label: f,
    count: proyectos.filter(p => p.financiador === f).length,
    color: FONDOS_GRANDES_COLORES[f] || '#64748B',
  })).filter(x => x.count > 0)

  // KPI: por prioridad
  const kpiPrioridad = ['Alta', 'Media', 'Baja'].map(pr => ({
    label: pr,
    count: proyectos.filter(p => p.prioridad === pr).length,
    color: PRIORIDAD_COLORES[pr].bg,
  }))

  const hayFiltros = filtroFondo !== 'Todos' || filtroTipo !== 'Todos' || filtroPrioridad !== 'Todas' || busqueda

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F4F6FA', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ══ SIDEBAR ══ */}
      <aside className={`flex-shrink-0 flex flex-col bg-white transition-all duration-300 overflow-hidden ${sidebarAbierto ? 'w-52' : 'w-0'}`}
        style={{ borderRight: '.5px solid #E5E7EB' }}>

        {/* Logo área */}
        <div className="px-4 pt-5 pb-4" style={{ borderBottom: '.5px solid #E5E7EB' }}>
          <img src="/imagen_transparente_molina.png" alt="Molina"
            className="w-full object-contain" style={{ height: 52 }}
            onError={e => e.target.style.display = 'none'} />
          <div className="mt-3 rounded-xl px-3 py-2" style={{ background: '#F3F4F6' }}>
            <p className="text-xs font-black text-gray-800 tracking-wide">SECPLAN</p>
            <p className="text-xs text-gray-500">Municipalidad de Molina</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">

          {/* Fondo único bloque con subfiltro inline */}
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-gray-400 px-3 mb-2">Fondo</p>
            <NavItem label="Todos" active={filtroFondo === 'Todos'}
              onClick={() => cambiarFondo('Todos')} />
            {FONDOS_GRANDES.map(f => {
              const tipos = TIPOS_POR_FONDO[f] || []
              const isActive = filtroFondo === f
              return (
                <div key={f}>
                  <NavItem label={f} active={isActive} dot onClick={() => cambiarFondo(f)} />
                  {isActive && tipos.length > 0 && (
                    <div className="mx-2 mt-1 mb-2 rounded-xl overflow-hidden"
                      style={{ border: '1px solid #E5E7EB', background: '#F9FAFB' }}>
                      <p className="text-xs font-black uppercase tracking-widest text-gray-400 px-3 pt-2.5 pb-1.5">
                        Tipo de fondo
                      </p>
                      <div className="px-1.5 pb-2">
                        <button
                          onClick={() => setFiltroTipo('Todos')}
                          className="w-full text-left flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all"
                          style={filtroTipo === 'Todos'
                            ? { background: '#111827', color: 'white', fontWeight: 600 }
                            : { color: '#6B7280' }}
                          onMouseEnter={e => { if (filtroTipo !== 'Todos') { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.color = '#111827' }}}
                          onMouseLeave={e => { if (filtroTipo !== 'Todos') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6B7280' }}}>
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: filtroTipo === 'Todos' ? 'white' : '#D1D5DB' }} />
                          Todos
                        </button>
                        {tipos.map(t => {
                          const col = FONDOS_COLORES[t]?.bg || '#64748B'
                          return (
                            <button key={t}
                              onClick={() => setFiltroTipo(t)}
                              className="w-full text-left flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all"
                              style={filtroTipo === t
                                ? { background: '#111827', color: 'white', fontWeight: 600 }
                                : { color: '#6B7280' }}
                              onMouseEnter={e => { if (filtroTipo !== t) { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.color = '#111827' }}}
                              onMouseLeave={e => { if (filtroTipo !== t) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6B7280' }}}>
                              <span className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ background: filtroTipo === t ? 'white' : col }} />
                              <span className="truncate">{t}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Prioridad */}
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-gray-400 px-3 mb-2">Prioridad</p>
            {prioridades.map(p => (
              <NavItem key={p} label={p} active={filtroPrioridad === p}
                onClick={() => setFiltroPrioridad(p)} dot={p !== 'Todas'} indent />
            ))}
          </div>

          {/* Admin */}
          {esAdmin && (
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 px-3 mb-2">Admin</p>
              <NavItem label="👥 Usuarios" active={mostrarAdmin} onClick={() => setMostrarAdmin(true)} />
            </div>
          )}
        </nav>

        {/* Usuario */}
        <div className="p-3" style={{ borderTop: '.5px solid #E5E7EB' }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
              style={{ background: '#111827', color: 'white' }}>
              {(usuarioData?.nombre || sesion.user.email)[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{usuarioData?.nombre || sesion.user.email}</p>
              <p className="text-xs text-gray-400 capitalize">{usuarioData?.rol || 'usuario'}</p>
            </div>
            <button onClick={() => supabase.auth.signOut()}
              className="text-xs text-gray-400 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0">
              Salir
            </button>
          </div>
        </div>
      </aside>

      {/* ══ CONTENIDO ══ */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* TOPBAR */}
        <header className="flex-shrink-0 relative shadow-lg"
          style={{ background: `linear-gradient(135deg, ${AZUL_OSC} 0%, ${AZUL} 100%)`, minHeight: 100 }}>
          {/* Toggle sidebar — esquina izquierda */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-3 z-10">
            <button onClick={() => setSidebarAbierto(v => !v)}
              className="text-white/60 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10">
              <IconMenu />
            </button>
          </div>

          {/* Logo centrado */}
          <div className="flex flex-col items-center justify-center h-full py-3">
            <img src="/imagen_transparente_molina2.png" alt="Municipalidad de Molina"
              style={{ height: 72, objectFit: 'contain' }}
              onError={e => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }} />
            <div style={{ display: 'none' }} className="flex-col items-center">
              <p className="text-white font-black text-xl tracking-widest">MOLINA</p>
              <p className="text-blue-200 text-xs">Tierra que Enamora</p>
            </div>
            <p className="text-blue-200 text-xs mt-1.5 tracking-wide">SECPLAN — Cartera de Proyectos</p>
          </div>

          {/* Botones — esquina derecha */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex items-center gap-2">
            {/* Exportar */}
            <div className="relative">
              <button onClick={(e) => { e.stopPropagation(); setMenuExportar(v => !v) }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all hover:scale-[1.03] active:scale-[0.97]"
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}>
                <IconDownload /><span>Exportar</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
                  style={{ transform: menuExportar ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .2s' }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {menuExportar && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl overflow-hidden z-50"
                  style={{ minWidth: 160, border: '.5px solid #E5E7EB' }}>
                  <button onClick={() => { exportarExcel(); setMenuExportar(false) }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors hover:bg-gray-50"
                    style={{ color: '#217346', borderBottom: '.5px solid #F3F4F6' }}>
                    <span style={{ fontSize: 16 }}>📊</span>
                    <div>
                      <p className="font-semibold text-gray-800 text-xs">Excel (.xlsx)</p>
                      <p className="text-xs text-gray-400">Editable, con resumen</p>
                    </div>
                  </button>
                  <button onClick={() => { exportarPDF(); setMenuExportar(false) }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors hover:bg-gray-50"
                    style={{ color: '#991B1B' }}>
                    <span style={{ fontSize: 16 }}>📄</span>
                    <div>
                      <p className="font-semibold text-gray-800 text-xs">PDF</p>
                      <p className="text-xs text-gray-400">Formal, con KPIs</p>
                    </div>
                  </button>
                </div>
              )}
            </div>
            {/* Nuevo proyecto */}
            <button onClick={() => setMostrarForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all hover:scale-[1.03] active:scale-[0.97]"
              style={{ background: VERDE }}>
              <IconPlus /><span>Nuevo proyecto</span>
            </button>
          </div>
        </header>

        {/* MAIN */}
        <main className="flex-1 overflow-y-auto px-6 py-5">

          {/* KPIs */}
          <div className="grid grid-cols-3 gap-4 mb-5">

            {/* Total */}
            <KpiCard icon={<IconChart />} label="Total de proyectos">
              <p className="text-5xl font-black leading-none" style={{ color: '#111827' }}>{proyectos.length}</p>
              {proyectosFiltrados.length !== proyectos.length && (
                <p className="text-xs text-gray-400 mt-2">{proyectosFiltrados.length} en vista actual</p>
              )}
            </KpiCard>

            {/* Por Fondo */}
            <KpiCard icon={<IconLayers />} label="Por Fondo">
              {kpiFondo.length === 0
                ? <p className="text-xs text-gray-300 italic">Sin datos aún</p>
                : kpiFondo.map(({ label, count, color }) => (
                    <KpiRow key={label} label={label} count={count} total={proyectos.length} color={color} />
                  ))
              }
            </KpiCard>

            {/* Por Prioridad */}
            <KpiCard icon={<IconStar />} label="Por Prioridad">
              {kpiPrioridad.map(({ label, count, color }) => (
                <KpiRow key={label} label={label} count={count} total={proyectos.length} color={color} />
              ))}
            </KpiCard>
          </div>

          {/* BARRA BÚSQUEDA */}
          <div className="bg-white rounded-2xl px-4 py-3 mb-4 flex items-center gap-3 flex-wrap"
            style={{ border: '.5px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div className="relative flex-1" style={{ minWidth: 180 }}>
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><IconSearch /></span>
              <input type="text" placeholder="Buscar proyectos..." value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none transition-all"
                style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}
                onFocus={e => e.target.style.borderColor = '#111827'}
                onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
            </div>

            <select value={filtroFondo} onChange={e => cambiarFondo(e.target.value)}
              className="rounded-xl px-3 py-2 text-sm outline-none cursor-pointer"
              style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', color: '#374151' }}>
              <option value="Todos">Todos los fondos</option>
              {FONDOS_GRANDES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>

            <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
              className="rounded-xl px-3 py-2 text-sm font-semibold outline-none cursor-pointer"
              style={{ border: '1.5px solid #111827', color: '#111827', background: '#F9FAFB' }}>
              <option value="Todos">Todos los tipos</option>
              {tiposDisponibles.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            <select value={filtroPrioridad} onChange={e => setFiltroPrioridad(e.target.value)}
              className="rounded-xl px-3 py-2 text-sm font-semibold outline-none cursor-pointer"
              style={{ border: '1.5px solid #111827', color: '#111827', background: '#F9FAFB' }}>
              {prioridades.map(p => <option key={p} value={p}>{p === 'Todas' ? 'Todas las prioridades' : p}</option>)}
            </select>

            {hayFiltros && (
              <button onClick={() => { setFiltroFondo('Todos'); setFiltroTipo('Todos'); setFiltroPrioridad('Todas'); setBusqueda('') }}
                className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{ background: '#F3F4F6', color: '#6B7280' }}
                onMouseEnter={e => e.currentTarget.style.background = '#E5E7EB'}
                onMouseLeave={e => e.currentTarget.style.background = '#F3F4F6'}>
                ✕ Limpiar
              </button>
            )}

            <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">
              {proyectosFiltrados.length} proyecto{proyectosFiltrados.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* TABLA */}
          <div className="bg-white rounded-2xl overflow-hidden"
            style={{ border: '.5px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            {cargando ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <div className="w-10 h-10 border-4 border-gray-100 rounded-full animate-spin" style={{ borderTopColor: '#111827' }} />
                <p className="text-sm text-gray-400">Cargando proyectos...</p>
              </div>
            ) : proyectosFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="text-5xl mb-3">📂</div>
                <p className="font-semibold text-gray-500">No hay proyectos</p>
                <p className="text-sm text-gray-400 mt-1">{busqueda ? `Sin resultados para "${busqueda}"` : 'Prueba cambiando los filtros'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full" style={{ minWidth: 960, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#111827' }}>
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
        <AgregarProyecto onClose={() => setMostrarForm(false)}
          onGuardado={() => { cargarProyectos(); setMostrarForm(false) }} />
      )}
      {proyectoEditando && (
        <EditarProyecto proyecto={proyectoEditando} usuario={sesion.user.email}
          onGuardado={() => { setProyectoEditando(null); cargarProyectos() }}
          onCerrar={() => setProyectoEditando(null)} />
      )}
      {mostrarAdmin && <AdminPanel onCerrar={() => setMostrarAdmin(false)} />}

      {/* MODAL DETALLE */}
      {proyectoDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setProyectoDetalle(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full overflow-y-auto"
            style={{ maxWidth: 560, maxHeight: '88vh' }}
            onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="px-6 py-4 flex items-start justify-between gap-3"
              style={{ background: `linear-gradient(135deg, ${AZUL_OSC} 0%, ${AZUL} 100%)`, borderBottom: '.5px solid rgba(255,255,255,0.1)' }}>
              <div>
                <p className="text-white font-black text-base leading-snug">{proyectoDetalle.nombre}</p>
                {proyectoDetalle.tipo_iniciativa && <p className="text-blue-200 text-xs mt-0.5">{proyectoDetalle.tipo_iniciativa}</p>}
              </div>
              <button onClick={() => setProyectoDetalle(null)} className="text-white/60 hover:text-white text-xl flex-shrink-0">✕</button>
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
                    {proyectoDetalle.financiador && <span className="px-3 py-1 rounded-lg text-xs font-semibold" style={{ background: '#F3F4F6', color: '#374151' }}>{proyectoDetalle.financiador}</span>}
                    {proyectoDetalle.estado && <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: ec.bg, color: ec.text }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: ec.dot }} />{proyectoDetalle.estado}
                    </span>}
                    {pc && <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: pc.bg, color: pc.text }}>{proyectoDetalle.prioridad}</span>}
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                      <span className="font-semibold">Progreso</span>
                      <span className="font-black text-gray-900">{proyectoDetalle.avance ?? 0}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${proyectoDetalle.avance ?? 0}%`, background: '#111827' }} />
                    </div>
                  </div>
                  {proyectoDetalle.descripcion && (
                    <p className="text-sm text-gray-600 leading-relaxed rounded-xl p-3" style={{ background: '#F9FAFB' }}>{proyectoDetalle.descripcion}</p>
                  )}
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      ['📅 Fecha ingreso', formatFecha(proyectoDetalle.created_at)],
                      ['👤 Encargado',     proyectoDetalle.encargado],
                      ['💰 Presupuesto',   proyectoDetalle.presupuesto ? formatMonto(proyectoDetalle.presupuesto, proyectoDetalle.moneda) : null],
                      ['💵 Asignado',      proyectoDetalle.asignado    ? formatMonto(proyectoDetalle.asignado,    proyectoDetalle.moneda) : null],
                      ['🗓 Inicio',        proyectoDetalle.fecha_inicio  ? formatFecha(proyectoDetalle.fecha_inicio)  : null],
                      ['🗓 Cierre',        proyectoDetalle.fecha_cierre  ? formatFecha(proyectoDetalle.fecha_cierre)  : null],
                    ].filter(([, v]) => v).map(([l, v]) => (
                      <div key={l} className="rounded-xl p-3" style={{ background: '#F9FAFB' }}>
                        <p className="text-xs text-gray-400 mb-0.5">{l}</p>
                        <p className="text-sm font-semibold text-gray-800">{v}</p>
                      </div>
                    ))}
                  </div>
                  {proyectoDetalle.ubicacion && (
                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(proyectoDetalle.ubicacion)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm font-medium rounded-xl p-3 transition-colors"
                      style={{ color: AZUL, background: '#EEF2FA' }}>
                      📍 {proyectoDetalle.ubicacion}
                    </a>
                  )}
                  {proyectoDetalle.link_drive && (
                    <a href={proyectoDetalle.link_drive} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white w-full hover:opacity-90 transition-all"
                      style={{ background: '#111827' }}>
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