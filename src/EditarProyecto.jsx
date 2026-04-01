import { useState } from 'react'
import { supabase } from './supabase'

export default function EditarProyecto({ proyecto, usuario, onGuardado, onCerrar }) {
  const [form, setForm] = useState({
    nombre: proyecto.nombre || '',
    fondo: proyecto.fondo || 'FRIL',
    estado: proyecto.estado || 'En planificación',
    avance: proyecto.avance || 0,
    descripcion: proyecto.descripcion || '',
    presupuesto: proyecto.presupuesto || '',
    asignado: proyecto.asignado || '',
    fecha_inicio: proyecto.fecha_inicio || '',
  })
  const [guardando, setGuardando] = useState(false)

  async function guardar() {
    setGuardando(true)

    const campos = ['nombre', 'fondo', 'estado', 'avance', 'descripcion', 'presupuesto', 'asignado', 'fecha_inicio']
    const registros = []

    campos.forEach(campo => {
      const anterior = String(proyecto[campo] || '')
      const nuevo = String(form[campo] || '')
      if (anterior !== nuevo) {
        registros.push({
          proyecto_id: proyecto.id,
          campo: campo,
          valor_anterior: anterior,
          valor_nuevo: nuevo,
          usuario: usuario,
        })
      }
    })

    await supabase.from('Proyectos').update(form).eq('id', proyecto.id)

    if (registros.length > 0) {
      await supabase.from('Historial').insert(registros)
    }

    setGuardando(false)
    onGuardado()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Editar proyecto</h2>
          <button onClick={onCerrar} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
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
            <button onClick={onCerrar}
              className="flex-1 border border-gray-200 rounded-lg py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">
              Cancelar
            </button>
            <button onClick={guardar} disabled={guardando}
              className="flex-1 bg-slate-900 text-white rounded-lg py-2 text-sm font-semibold hover:bg-slate-700 disabled:opacity-50">
              {guardando ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}