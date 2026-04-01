import { useState, useEffect } from 'react'
import { supabase } from './supabase'

const COLORES_FONDO = {
  FRIL:      { bg: 'bg-blue-100',   text: 'text-blue-700' },
  FRPD:      { bg: 'bg-purple-100', text: 'text-purple-700' },
  Municipal: { bg: 'bg-green-100',  text: 'text-green-700' },
  FNDR:      { bg: 'bg-red-100',    text: 'text-red-700' },
}

const COLORES_ESTADO = {
  'En planificación': 'bg-yellow-100 text-yellow-700',
  'En licitación':    'bg-blue-100 text-blue-700',
  'En ejecución':     'bg-green-100 text-green-700',
  'Terminado':        'bg-indigo-100 text-indigo-700',
  'Paralizado':       'bg-red-100 text-red-700',
}

const NOMBRES_CAMPO = {
  nombre: 'Nombre',
  fondo: 'Fondo',
  estado: 'Estado',
  avance: 'Avance %',
  descripcion: 'Descripción',
  presupuesto: 'Presupuesto',
  asignado: 'Monto asignado',
  fecha_inicio: 'Fecha de inicio',
}

export default function DetalleProyecto({ proyecto, onCerrar, onEditar }) {
  const [historial, setHistorial] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarHistorial()
  }, [proyecto.id])

  async function cargarHistorial() {
    const { data } = await supabase
      .from('Historial')
      .select('*')
      .eq('proyecto_id', proyecto.id)
      .order('created_at', { ascending: false })
    setHistorial(data || [])
    setCargando(false)
  }

  const c = COLORES_FONDO[proyecto.fondo] || COLORES_FONDO['FRIL']
  const e = COLORES_ESTADO[proyecto.estado] || 'bg-gray-100 text-gray-600'

  function formatearFecha(fecha) {
    return new Date(fecha).toLocaleDateString('es-CL', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-start">
          <div className="flex-1 pr-4">
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${c.bg} ${c.text}`}>{proyecto.fondo}</span>
            <h2 className="text-lg font-bold text-gray-900 mt-2 leading-snug">{proyecto.nombre}</h2>
          </div>
          <button onClick={onCerrar} className="text-gray-400 hover:text-gray-600 text-xl flex-shrink-0">✕</button>
        </div>

        <div className="p-6 space-y-6">

          {/* Descripción */}
          {proyecto.descripcion && (
            <p className="text-sm text-gray-600 leading-relaxed">{proyecto.descripcion}</p>
          )}

          {/* Avance */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${e}`}>{proyecto.estado}</span>
              <span className="text-2xl font-bold text-gray-900">{proyecto.avance}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: proyecto.avance + '%' }}></div>
            </div>
          </div>

          {/* Info financiera */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Presupuesto estimado', value: proyecto.presupuesto },
              { label: 'Monto asignado', value: proyecto.asignado },
              { label: 'Fecha de inicio', value: proyecto.fecha_inicio },
              { label: 'Tipo de fondo', value: proyecto.fondo },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">{item.label}</p>
                <p className="text-sm font-bold text-gray-900">{item.value || '—'}</p>
              </div>
            ))}
          </div>

          {/* Botón editar */}
          <button onClick={onEditar}
            className="w-full bg-slate-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-700 transition-all">
            Editar proyecto
          </button>

          {/* Historial */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">Historial de cambios</h3>
            {cargando ? (
              <p className="text-xs text-gray-400">Cargando historial...</p>
            ) : historial.length === 0 ? (
              <p className="text-xs text-gray-400">Sin cambios registrados aún.</p>
            ) : (
              <div className="border-l-2 border-gray-200 pl-4 space-y-4">
                {historial.map(h => (
                  <div key={h.id} className="relative">
                    <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-white"></div>
                    <p className="text-xs text-gray-400 mb-0.5">{formatearFecha(h.created_at)}</p>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">{NOMBRES_CAMPO[h.campo] || h.campo}</span>
                      {': '}
                      <span className="line-through text-gray-400">{h.valor_anterior || '—'}</span>
                      {' → '}
                      <span className="font-semibold text-gray-900">{h.valor_nuevo}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">por {h.usuario}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}