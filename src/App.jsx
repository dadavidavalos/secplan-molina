import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Login from './Login'
import EditarProyecto from './EditarProyecto'
import DetalleProyecto from './DetalleProyecto'

const COLORES_FONDO = {
  FRIL:      { bg: 'bg-blue-100',   text: 'text-blue-700',   barra: 'bg-blue-500' },
  FRPD:      { bg: 'bg-purple-100', text: 'text-purple-700', barra: 'bg-purple-500' },
  Municipal: { bg: 'bg-green-100',  text: 'text-green-700',  barra: 'bg-green-500' },
  FNDR:      { bg: 'bg-red-100',    text: 'text-red-700',    barra: 'bg-red-500' },
}

const COLORES_ESTADO = {
  'En planificación': 'bg-yellow-100 text-yellow-700',
  'En licitación':    'bg-blue-100 text-blue-700',
  'En ejecución':     'bg-green-100 text-green-700',
  'Terminado':        'bg-indigo-100 text-indigo-700',
  'Paralizado':       'bg-red-100 text-red-700',
}

export default function App() {
  const [sesion, setSesion] = useState(null)
  const [proyectos, setProyectos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState('Todos')
  const [mostrarForm, setMostrarForm] = useState(false)
  const [proyectoEditando, setProyectoEditando] = useState(null)
  const [proyectoDetalle, setProyectoDetalle] = useState(null)
  const [form, setForm] = useState({
    nombre: '', fondo: 'FRIL', estado: 'En planificación',
    avance: 0, descripcion: '', presupuesto: '', asignado: '', fecha_inicio: ''
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSesion(session))
    supabase.auth.onAuthStateChange((_event, session) => setSesion(session))
  }, [])

  useEffect(() => {
    if (sesion) cargarProyectos()
  }, [sesion])

  if (!sesion) return <Login />

  async function cargarProyectos() {
    const { data } = await supabase.from('Proyectos').select('*')
    setProyectos(data || [])
    setCargando(false)
  }

  async function agregarProyecto() {
    if (!form.nombre) return
    await supabase.from('Proyectos').insert([form])
    setForm({ nombre: '', fondo: 'FRIL', estado: 'En planificación', avance: 0, descripcion: '', presupuesto: '', asignado: '', fecha_inicio: '' })
    setMostrarForm(false)
    cargarProyectos()
  }

  async function eliminarProyecto(id) {
    await supabase.from('Proyectos').delete().eq('id', id)
    cargarProyectos()
  }

  const fondos = ['Todos', 'FRIL', 'FRPD', 'Municipal', 'FNDR']
  const proyectosFiltrados = filtro === 'Todos' ? proyectos : proyectos.filter(p => p.fondo === filtro)
  const enEjecucion = proyectos.filter(p => p.estado === 'En ejecución').length
  const avancePromedio = proyectos.length ? Math.round(proyectos.reduce((a, p) => a + (p.avance || 0), 0) / proyectos.length) : 0

  return (
    <div className="flex h-screen bg-gray-50 font-sans">

      {/* SIDEBAR */}
      <aside className="w-56 bg-slate-900 flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-slate-700">
          <div className="w-9 h-9 bg-amber-400 rounded-lg flex items-center justify-center font-bold text-slate-900 text-sm mb-3">MO</div>
          <p className="text-white font-semibold text-sm">SECPLAN Molina</p>
          <p className="text-slate-400 text-xs mt-0.5">Región del Maule</p>
        </div>
        <nav className="p-3 flex-1">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-2 mt-3 mb-1">Fondos</p>
          {fondos.map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-0.5 transition-all ${filtro === f ? 'bg-amber-400 text-slate-900 font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              {f}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-xs font-bold text-slate-900">
              {sesion.user.email[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{sesion.user.email}</p>
              <p className="text-slate-400 text-xs">Usuario</p>
            </div>
            <button onClick={() => supabase.auth.signOut()} className="text-slate-400 hover:text-white text-xs">
              Salir
            </button>
          </div>
        </div>
      </aside>

      {/* CONTENIDO */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dashboard de Proyectos</h1>
            <p className="text-sm text-gray-500">Municipalidad de Molina · 2024–2025</p>
          </div>
          <button onClick={() => setMostrarForm(true)}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-700 transition-all">
            + Nuevo proyecto
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6">

          {/* KPIs */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total proyectos', value: proyectos.length, color: 'border-blue-500' },
              { label: 'En ejecución', value: enEjecucion, color: 'border-green-500' },
              { label: 'Avance promedio', value: avancePromedio + '%', color: 'border-amber-500' },
              { label: 'Fondos activos', value: [...new Set(proyectos.map(p => p.fondo))].length, color: 'border-purple-500' },
            ].map(k => (
              <div key={k.label} className={`bg-white rounded-xl p-4 border border-gray-200 border-b-4 ${k.color}`}>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{k.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{k.value}</p>
              </div>
            ))}
          </div>

          {/* FILTROS */}
          <div className="flex gap-2 mb-5 flex-wrap">
            {fondos.map(f => (
              <button key={f} onClick={() => setFiltro(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${filtro === f ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-gray-600 border-gray-300 hover:border-slate-900'}`}>
                {f}
              </button>
            ))}
          </div>

          {/* TARJETAS */}
          {cargando ? (
            <p className="text-gray-400 text-sm">Cargando proyectos...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {proyectosFiltrados.map(p => {
                const c = COLORES_FONDO[p.fondo] || COLORES_FONDO['FRIL']
                const e = COLORES_ESTADO[p.estado] || 'bg-gray-100 text-gray-600'
                return (
                  <div key={p.id}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all cursor-pointer"
                    onClick={() => setProyectoDetalle(p)}>
                    <div className="p-4 border-b border-gray-100">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${c.bg} ${c.text}`}>{p.fondo}</span>
                      <h3 className="font-semibold text-gray-900 mt-2 text-sm leading-snug">{p.nombre}</h3>
                    </div>
                    <div className="p-4">
                      {p.descripcion && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{p.descripcion}</p>}
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${e}`}>{p.estado}</span>
                        <span className="text-lg font-bold text-gray-900">{p.avance}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                        <div className={`h-full rounded-full ${c.barra}`} style={{ width: p.avance + '%' }}></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mb-3">
                        <span>Presup: <span className="font-semibold text-gray-700">{p.presupuesto || '—'}</span></span>
                        <span>Asignado: <span className="font-semibold text-gray-700">{p.asignado || '—'}</span></span>
                      </div>
                      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setProyectoEditando(p)}
                          className="flex-1 text-xs text-blue-500 hover:text-blue-700 hover:bg-blue-50 py-1.5 rounded transition-all border border-blue-100">
                          Editar
                        </button>
                        <button onClick={() => eliminarProyecto(p.id)}
                          className="flex-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 py-1.5 rounded transition-all border border-red-100">
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

      {/* MODAL AGREGAR */}
      {mostrarForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Agregar proyecto</h2>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Nombre', key: 'nombre', placeholder: 'Nombre del proyecto' },
                { label: 'Descripción', key: 'descripcion', placeholder: 'Descripción breve' },
                { label: 'Presupuesto', key: 'presupuesto', placeholder: 'Ej: $185 M' },
                { label: 'Monto asignado', key: 'asignado', placeholder: 'Ej: $172 M' },
                { label: 'Fecha de inicio', key: 'fecha_inicio', placeholder: 'Ej: Mar. 2024' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{f.label}</label>
                  <input type="text" placeholder={f.placeholder} value={form[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-900"/>
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tipo de fondo</label>
                <select value={form.fondo} onChange={e => setForm({ ...form, fondo: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-900">
                  {['FRIL','FRPD','Municipal','FNDR'].map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Estado</label>
                <select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-900">
                  {['En planificación','En licitación','En ejecución','Terminado','Paralizado'].map(e => <option key={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Avance %</label>
                <input type="number" min="0" max="100" value={form.avance}
                  onChange={e => setForm({ ...form, avance: Number(e.target.value) })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-900"/>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setMostrarForm(false)}
                  className="flex-1 border border-gray-200 rounded-lg py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                  Cancelar
                </button>
                <button onClick={agregarProyecto}
                  className="flex-1 bg-slate-900 text-white rounded-lg py-2 text-sm font-semibold hover:bg-slate-700">
                  Agregar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {proyectoEditando && (
        <EditarProyecto
          proyecto={proyectoEditando}
          usuario={sesion.user.email}
          onGuardado={() => { setProyectoEditando(null); cargarProyectos() }}
          onCerrar={() => setProyectoEditando(null)}
        />
      )}

      {/* MODAL DETALLE */}
      {proyectoDetalle && (
        <DetalleProyecto
          proyecto={proyectoDetalle}
          onCerrar={() => setProyectoDetalle(null)}
          onEditar={() => { setProyectoEditando(proyectoDetalle); setProyectoDetalle(null) }}
        />
      )}

    </div>
  )
}