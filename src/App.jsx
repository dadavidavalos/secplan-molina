import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Login from './Login'
import EditarProyecto from './EditarProyecto'
import AgregarProyecto from './AgregarProyecto'
import AdminPanel from './AdminPanel'

const COLORES_FONDO = {
  FRIL:      { bg: 'bg-blue-100',   text: 'text-blue-700',   barra: 'bg-blue-500' },
  FRPD:      { bg: 'bg-purple-100', text: 'text-purple-700', barra: 'bg-purple-500' },
  Municipal: { bg: 'bg-green-100',  text: 'text-green-700',  barra: 'bg-green-500' },
  FNDR:      { bg: 'bg-red-100',    text: 'text-red-700',    barra: 'bg-red-500' },
}

const COLORES_ESTADO = {
  'Idea':        'bg-gray-100 text-gray-700',
  'Formulación': 'bg-yellow-100 text-yellow-800',
  'Postulación': 'bg-blue-100 text-blue-800',
  'Aprobado':    'bg-green-100 text-green-800',
  'Licitación':  'bg-purple-100 text-purple-800',
  'Adjudicado':  'bg-orange-100 text-orange-800',
  'Finalizado':  'bg-indigo-100 text-indigo-800',
  // estados antiguos por compatibilidad
  'En planificación': 'bg-yellow-100 text-yellow-700',
  'En licitación':    'bg-blue-100 text-blue-700',
  'En ejecución':     'bg-green-100 text-green-700',
  'Terminado':        'bg-indigo-100 text-indigo-700',
  'Paralizado':       'bg-red-100 text-red-700',
}

const COLORES_PRIORIDAD = {
  Alta:  'bg-red-100 text-red-700',
  Media: 'bg-yellow-100 text-yellow-700',
  Baja:  'bg-green-100 text-green-700',
}

export default function App() {
  const [sesion, setSesion] = useState(null)
  const [usuarioData, setUsuarioData] = useState(null)
  const [proyectos, setProyectos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState('Todos')
  const [mostrarForm, setMostrarForm] = useState(false)
  const [mostrarAdmin, setMostrarAdmin] = useState(false)
  const [proyectoEditando, setProyectoEditando] = useState(null)
  const [proyectoDetalle, setProyectoDetalle] = useState(null)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSesion(session))
    supabase.auth.onAuthStateChange((_event, session) => setSesion(session))
  }, [])

  useEffect(() => {
    if (sesion) {
      cargarProyectos()
      cargarUsuarioData()
    }
  }, [sesion])

  if (!sesion) return <Login />

  async function cargarUsuarioData() {
    const { data } = await supabase
      .from('Usuarios')
      .select('*')
      .eq('id', sesion.user.id)
      .single()
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
  const fondos = ['Todos', 'GORE', 'SUBDERE', 'Fondos Sectoriales', 'Municipal (Fondos Propios)', 'Otro']

  const proyectosFiltrados = proyectos
    .filter(p => filtro === 'Todos' || p.financiador === filtro || p.fondo === filtro)
    .filter(p => !busqueda || p.nombre?.toLowerCase().includes(busqueda.toLowerCase()))

  const enEjecucion = proyectos.filter(p =>
    ['En ejecución', 'Adjudicado', 'Licitación'].includes(p.estado)
  ).length
  const avancePromedio = proyectos.length
    ? Math.round(proyectos.reduce((a, p) => a + (p.avance || 0), 0) / proyectos.length)
    : 0

  return (
    <div className="flex h-screen bg-gray-50 font-sans">

      {/* SIDEBAR */}
      <aside className="w-56 bg-slate-900 flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-slate-700">
          <div className="w-9 h-9 bg-amber-400 rounded-lg flex items-center justify-center font-bold text-slate-900 text-sm mb-3">
            MO
          </div>
          <p className="text-white font-semibold text-sm">SECPLAN Molina</p>
          <p className="text-slate-400 text-xs mt-0.5">Región del Maule</p>
        </div>

        <nav className="p-3 flex-1 overflow-y-auto">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-2 mt-3 mb-1">
            Financiadores
          </p>
          {fondos.map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-0.5 transition-all ${
                filtro === f
                  ? 'bg-amber-400 text-slate-900 font-semibold'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}>
              {f}
            </button>
          ))}

          {esAdmin && (
            <>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-2 mt-4 mb-1">
                Administración
              </p>
              <button onClick={() => setMostrarAdmin(true)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm mb-0.5 transition-all text-slate-400 hover:bg-slate-800 hover:text-white">
                👥 Usuarios
              </button>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-xs font-bold text-slate-900">
              {sesion.user.email[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">
                {usuarioData?.nombre || sesion.user.email}
              </p>
              <p className="text-slate-400 text-xs capitalize">{usuarioData?.rol || 'Usuario'}</p>
            </div>
            <button onClick={() => supabase.auth.signOut()}
              className="text-slate-400 hover:text-white text-xs transition-colors">
              Salir
            </button>
          </div>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* HEADER */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0 gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dashboard de Proyectos</h1>
            <p className="text-sm text-gray-500">Municipalidad de Molina · SECPLAN</p>
          </div>

          {/* Barra de búsqueda */}
          <div className="flex-1 max-w-xs relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Buscar proyecto..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-amber-400 bg-gray-50"
            />
          </div>

          <button
            onClick={() => setMostrarForm(true)}
            className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-700 transition-all whitespace-nowrap flex-shrink-0">
            + Nuevo proyecto
          </button>
        </header>

        {/* MAIN */}
        <main className="flex-1 overflow-y-auto p-6">

          {/* KPIs */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total proyectos',  value: proyectos.length,   color: 'border-blue-500' },
              { label: 'En ejecución',     value: enEjecucion,        color: 'border-green-500' },
              { label: 'Avance promedio',  value: avancePromedio + '%', color: 'border-amber-500' },
              { label: 'Financiadores',    value: [...new Set(proyectos.map(p => p.financiador).filter(Boolean))].length, color: 'border-purple-500' },
            ].map(k => (
              <div key={k.label} className={`bg-white rounded-xl p-4 border border-gray-200 border-b-4 ${k.color}`}>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{k.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{k.value}</p>
              </div>
            ))}
          </div>

          {/* Filtros rápidos */}
          <div className="flex gap-2 mb-5 flex-wrap">
            {fondos.map(f => (
              <button key={f} onClick={() => setFiltro(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  filtro === f
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-slate-900'
                }`}>
                {f}
              </button>
            ))}
          </div>

          {/* Resultado búsqueda */}
          {busqueda && (
            <p className="text-xs text-gray-400 mb-3">
              {proyectosFiltrados.length} resultado{proyectosFiltrados.length !== 1 ? 's' : ''} para "{busqueda}"
            </p>
          )}

          {/* TARJETAS */}
          {cargando ? (
            <p className="text-gray-400 text-sm">Cargando proyectos...</p>
          ) : proyectosFiltrados.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">📂</p>
              <p className="text-sm font-medium">No hay proyectos{busqueda ? ` para "${busqueda}"` : ''}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {proyectosFiltrados.map(p => {
                const colorFondo = COLORES_FONDO[p.fondo] || { bg: 'bg-gray-100', text: 'text-gray-700', barra: 'bg-gray-400' }
                const colorEstado = COLORES_ESTADO[p.estado] || 'bg-gray-100 text-gray-600'
                const colorPrioridad = COLORES_PRIORIDAD[p.prioridad]

                return (
                  <div key={p.id}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all cursor-pointer"
                    onClick={() => setProyectoDetalle(p)}>

                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Badge financiador o fondo */}
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${colorFondo.bg} ${colorFondo.text}`}>
                          {p.financiador || p.fondo || '—'}
                        </span>
                        {p.fondo && p.financiador && (
                          <span className="text-xs text-gray-400 font-medium">{p.fondo}</span>
                        )}
                        {/* Tipo iniciativa */}
                        {p.tipo_iniciativa && (
                          <span className="text-xs text-gray-400 border border-gray-200 px-2 py-0.5 rounded-full">
                            {p.tipo_iniciativa}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 mt-2 text-sm leading-snug">{p.nombre}</h3>
                      {p.encargado && (
                        <p className="text-xs text-gray-400 mt-1">👤 {p.encargado}</p>
                      )}
                    </div>

                    <div className="p-4">
                      {p.descripcion && (
                        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{p.descripcion}</p>
                      )}

                      {/* Estado + avance */}
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colorEstado}`}>
                          {p.estado}
                        </span>
                        <span className="text-lg font-bold text-gray-900">{p.avance ?? 0}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                        <div className={`h-full rounded-full transition-all ${colorFondo.barra}`}
                          style={{ width: (p.avance ?? 0) + '%' }} />
                      </div>

                      {/* Financiamiento */}
                      <div className="flex justify-between text-xs text-gray-500 mb-2">
                        <span>Presup: <span className="font-semibold text-gray-700">
                          {p.presupuesto ? (p.moneda === 'UTM' ? `${p.presupuesto} UTM` : `$${Number(p.presupuesto).toLocaleString('es-CL')}`) : '—'}
                        </span></span>
                        <span>Asignado: <span className="font-semibold text-gray-700">
                          {p.asignado ? (p.moneda === 'UTM' ? `${p.asignado} UTM` : `$${Number(p.asignado).toLocaleString('es-CL')}`) : '—'}
                        </span></span>
                      </div>

                      {/* Fila inferior: prioridad + links */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        {p.prioridad && colorPrioridad && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorPrioridad}`}>
                            ● {p.prioridad}
                          </span>
                        )}
                        <div className="flex gap-2 ml-auto">
                          {p.ubicacion && (
                            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.ubicacion)}`}
                              target="_blank" rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="text-xs text-blue-500 hover:text-blue-700 hover:underline" title="Ver en Maps">
                              📍 Mapa
                            </a>
                          )}
                          {p.link_drive && (
                            <a href={p.link_drive} target="_blank" rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="text-xs text-green-600 hover:text-green-800 hover:underline" title="Abrir Drive">
                              📁 Drive
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Botones */}
                      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setProyectoEditando(p)}
                          className="flex-1 text-xs text-blue-500 hover:text-blue-700 hover:bg-blue-50 py-1.5 rounded-lg transition-all border border-blue-100">
                          Editar
                        </button>
                        <button onClick={() => eliminarProyecto(p.id)}
                          className="flex-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 py-1.5 rounded-lg transition-all border border-red-100">
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>

      {/* MODAL: NUEVO PROYECTO */}
      {mostrarForm && (
        <AgregarProyecto
          onClose={() => setMostrarForm(false)}
          onGuardado={() => { cargarProyectos(); setMostrarForm(false); }}
        />
      )}

      {/* MODAL: EDITAR PROYECTO */}
      {proyectoEditando && (
        <EditarProyecto
          proyecto={proyectoEditando}
          usuario={sesion.user.email}
          onGuardado={() => { setProyectoEditando(null); cargarProyectos() }}
          onCerrar={() => setProyectoEditando(null)}
        />
      )}

      {/* PANEL ADMIN */}
      {mostrarAdmin && (
        <AdminPanel onCerrar={() => setMostrarAdmin(false)} />
      )}
    </div>
  )
}