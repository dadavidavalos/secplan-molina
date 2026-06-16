import { useState } from 'react'
import { supabase } from './supabase'
import FichaEvaluacion, { calcularViabilidad } from './FichaEvaluacion'
import UbicacionMapa from './UbicacionMapa'

const FONDOS = {
  GORE: ["FNDR", "FRIL", "-5000 UTM", "Circular 33", "FNDR 8% (Subvenciones actividades)", "Financiamiento para Programas", "FRPD"],
  SUBDERE: ["PMU (Mejoramiento Urbano)", "PMB (Mejoramiento de Barrios)", "PTRAC (Tenencia Responsable)", "PRBIPE (Revitalización de Barrios)"],
  "Fondos Sectoriales": ["MINVU - Pavimentación Participativa", "MINVU - Espacios Públicos"],
  "Municipal (Fondos Propios)": ["Presupuesto Municipal"],
  Otro: ["__otro__"],
}

const ESTADOS = [
  { label: "Idea", pct: 5 },
  { label: "Formulación", pct: 15 },
  { label: "Postulación", pct: 30 },
  { label: "Aprobado", pct: 50 },
  { label: "Licitación", pct: 65 },
  { label: "Adjudicado", pct: 80 },
  { label: "Finalizado", pct: 100 },
]

const ESTADO_COLORES = {
  Idea: "bg-gray-100 text-gray-700",
  Formulación: "bg-yellow-100 text-yellow-800",
  Postulación: "bg-blue-100 text-blue-800",
  Aprobado: "bg-green-100 text-green-800",
  Licitación: "bg-purple-100 text-purple-800",
  Adjudicado: "bg-orange-100 text-orange-800",
  Finalizado: "bg-indigo-100 text-indigo-800",
}

function detectarFinanciador(fondo) {
  if (!fondo) return ""
  for (const [financiador, fondos] of Object.entries(FONDOS)) {
    if (fondos.includes(fondo)) return financiador
  }
  return "Otro"
}

export default function EditarProyecto({ proyecto, usuario, onGuardado, onCerrar }) {
  const financiadorInicial = detectarFinanciador(proyecto.fondo || "")
  const esFondoOtro = financiadorInicial === "Otro" && proyecto.fondo && proyecto.fondo !== "__otro__"

  // Ficha pre-rellenada con datos guardados del proyecto
  const [ficha, setFicha] = useState({
    tipo_organismo: proyecto.ficha_organismo || "",
    iniciativas_previas: proyecto.ficha_iniciativas_previas ?? null,
    cbr: proyecto.ficha_cbr ?? null,
    rol_avaluo: proyecto.ficha_rol_avaluo ?? null,
    propiedad_municipal: proyecto.ficha_propiedad_municipal ?? null,
    comodato: proyecto.ficha_comodato ?? null,
    permiso_edificacion: proyecto.ficha_permiso_edificacion ?? null,
    tipo_terreno: proyecto.ficha_tipo_terreno || "",
    ifc: proyecto.ficha_ifc ?? null,
    zonificacion: proyecto.ficha_zonificacion ?? null,
    pladeco: proyecto.ficha_pladeco ?? null,
    nombre_proyecto: proyecto.nombre || "",
    responsable: proyecto.encargado || "",
    fecha: new Date().toLocaleDateString("es-CL"),
  })

  const [form, setForm] = useState({
    tipo_iniciativa: proyecto.tipo_iniciativa || "Proyecto",
    nombre: proyecto.nombre || "",
    descripcion: proyecto.descripcion || "",
    financiador: financiadorInicial,
    tipo_fondo: esFondoOtro ? "__otro__" : (proyecto.fondo || ""),
    tipo_fondo_otro: esFondoOtro ? (proyecto.fondo || "") : "",
    moneda: proyecto.moneda || "CLP",
    moneda_presupuesto: proyecto.moneda || "CLP",
    moneda_cotizado: proyecto.moneda_cotizado || "CLP",
    moneda_asignado: proyecto.moneda_asignado || "CLP",
    presupuesto: proyecto.presupuesto || "",
    monto_cotizado: proyecto.monto_cotizado || "",
    monto_asignado: proyecto.asignado || "",
    ubicacion: proyecto.ubicacion || "",
    estado: proyecto.estado || "",
    fecha_inicio: proyecto.fecha_inicio || "",
    fecha_cierre: proyecto.fecha_cierre || "",
    prioridad: proyecto.prioridad || "Media",
    link_drive: proyecto.link_drive || "",
    encargado: proyecto.encargado || "",
    imagen_url: proyecto.imagen_url || "",
  })

  const [paso, setPaso] = useState(1)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState("")
  const [subiendo, setSubiendo] = useState(false)
  const [imagenPreview, setImagenPreview] = useState(proyecto.imagen_url || "")
  const [imagenFile, setImagenFile] = useState(null)

  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const estadoActual = ESTADOS.find((e) => e.label === form.estado)
  const pctAvance = estadoActual?.pct ?? proyecto.avance ?? 0
  const fichaViable = calcularViabilidad(ficha)


  const uploadImagen = async (file) => {
    if (!file) return null
    setSubiendo(true)
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('Proyectos').upload(fileName, file, { upsert: true })
    setSubiendo(false)
    if (error) { setError('Error subiendo imagen: ' + error.message); return null }
    const { data } = supabase.storage.from('Proyectos').getPublicUrl(fileName)
    return data.publicUrl
  }

  async function guardar() {
    if (!form.nombre.trim()) { setError("El nombre del proyecto es obligatorio."); return }
    if (!form.estado) { setError("Selecciona un estado para el proyecto."); return }
    setGuardando(true)
    setError("")

    let imagenFinal = form.imagen_url
    if (imagenFile) {
      const url = await uploadImagen(imagenFile)
      if (url) imagenFinal = url
    }

    const tipoFondoFinal = form.tipo_fondo === "__otro__" ? form.tipo_fondo_otro : form.tipo_fondo

    const datosNuevos = {
      tipo_iniciativa: form.tipo_iniciativa,
      nombre: form.nombre,
      descripcion: form.descripcion,
      financiador: form.financiador,
      fondo: tipoFondoFinal,
      moneda: form.moneda_presupuesto,
      moneda_cotizado: form.moneda_cotizado,
      moneda_asignado: form.moneda_asignado,
      presupuesto: form.presupuesto,
      monto_cotizado: form.monto_cotizado,
      asignado: form.monto_asignado,
      ubicacion: form.ubicacion,
      estado: form.estado,
      avance: pctAvance,
      fecha_inicio: form.fecha_inicio,
      fecha_cierre: form.fecha_cierre,
      prioridad: form.prioridad,
      link_drive: form.link_drive,
      encargado: form.encargado,
      ficha_viable: fichaViable,
      ficha_organismo: ficha.tipo_organismo,
      ficha_iniciativas_previas: ficha.iniciativas_previas,
      ficha_cbr: ficha.cbr,
      ficha_rol_avaluo: ficha.rol_avaluo,
      ficha_propiedad_municipal: ficha.propiedad_municipal,
      ficha_comodato: ficha.comodato,
      ficha_permiso_edificacion: ficha.permiso_edificacion,
      ficha_tipo_terreno: ficha.tipo_terreno,
      ficha_ifc: ficha.ifc,
      ficha_zonificacion: ficha.zonificacion,
      ficha_pladeco: ficha.pladeco,
      imagen_url: imagenFinal,
    }

    const camposOriginales = {
      tipo_iniciativa: proyecto.tipo_iniciativa,
      nombre: proyecto.nombre,
      descripcion: proyecto.descripcion,
      financiador: proyecto.financiador,
      fondo: proyecto.fondo,
      moneda: proyecto.moneda,
      presupuesto: proyecto.presupuesto,
      monto_cotizado: proyecto.monto_cotizado,
      asignado: proyecto.asignado,
      ubicacion: proyecto.ubicacion,
      estado: proyecto.estado,
      avance: proyecto.avance,
      fecha_inicio: proyecto.fecha_inicio,
      fecha_cierre: proyecto.fecha_cierre,
      prioridad: proyecto.prioridad,
      link_drive: proyecto.link_drive,
      encargado: proyecto.encargado,
      ficha_viable: proyecto.ficha_viable,
      ficha_organismo: proyecto.ficha_organismo,
      ficha_iniciativas_previas: proyecto.ficha_iniciativas_previas,
      ficha_cbr: proyecto.ficha_cbr,
      ficha_rol_avaluo: proyecto.ficha_rol_avaluo,
      ficha_propiedad_municipal: proyecto.ficha_propiedad_municipal,
      ficha_comodato: proyecto.ficha_comodato,
      ficha_permiso_edificacion: proyecto.ficha_permiso_edificacion,
      ficha_tipo_terreno: proyecto.ficha_tipo_terreno,
      ficha_ifc: proyecto.ficha_ifc,
      ficha_zonificacion: proyecto.ficha_zonificacion,
      ficha_pladeco: proyecto.ficha_pladeco,
      imagen_url: proyecto.imagen_url,
    }

    const registros = []
    for (const [campo, valorAnterior] of Object.entries(camposOriginales)) {
      const anterior = String(valorAnterior ?? "")
      const nuevo = String(datosNuevos[campo] ?? "")
      if (anterior !== nuevo) {
        registros.push({
          proyecto_id: proyecto.id,
          campo,
          valor_anterior: anterior,
          valor_nuevo: nuevo,
          usuario,
        })
      }
    }

    await supabase.from("Proyectos").update(datosNuevos).eq("id", proyecto.id)
    if (registros.length > 0) {
      await supabase.from("Historial").insert(registros)
    }

    setGuardando(false)
    onGuardado()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Editar proyecto</h2>
            <p className="text-xs text-gray-400 mt-0.5">Paso {paso} de 3</p>
          </div>
          <button onClick={onCerrar} className="text-gray-400 hover:text-gray-600 text-xl font-light leading-none">✕</button>
        </div>

        {/* Barra de pasos */}
        <div className="px-6 pt-4">
          <div className="flex gap-2">
            {[1, 2, 3].map((p) => (
              <div key={p} className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${p <= paso ? "bg-amber-400" : "bg-gray-100"}`} />
            ))}
          </div>
          <div className="flex mt-1">
            {["Ficha evaluación", "Datos del proyecto", "Financiamiento"].map((l) => (
              <span key={l} className="flex-1 text-center text-xs text-gray-400">{l}</span>
            ))}
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="overflow-y-auto flex-1 px-6 py-5">

          {/* ─── PASO 1: FICHA DE EVALUACIÓN ─── */}
          {paso === 1 && (
            <FichaEvaluacion
              ficha={ficha}
              onChange={(fn) => setFicha((prev) => fn(prev))}
              nombreProyecto={form.nombre}
            />
          )}

          {/* ─── PASO 2: DATOS DEL PROYECTO ─── */}
          {paso === 2 && (
            <div className="space-y-4">

              <Campo label="Tipo de iniciativa">
                <div className="flex gap-3">
                  {["Proyecto", "Programa"].map((t) => (
                    <button key={t} onClick={() => setF("tipo_iniciativa", t)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${form.tipo_iniciativa === t ? "bg-slate-900 border-slate-900 text-white" : "border-gray-200 text-gray-600 hover:border-slate-300"}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </Campo>

              <Campo label="Nombre del proyecto *">
                <input className="input text-base py-3" placeholder="Ej: Construcción sede social Población Las Rosas"
                  value={form.nombre} onChange={(e) => setF("nombre", e.target.value)} />
              </Campo>

              <Campo label="Descripción">
                <textarea className="input resize-none text-base" rows={5} placeholder="Descripción breve del proyecto"
                  value={form.descripcion} onChange={(e) => setF("descripcion", e.target.value)} />
              </Campo>

              <Campo label="Financiador">
                <select className="input" value={form.financiador}
                  onChange={(e) => { setF("financiador", e.target.value); setF("tipo_fondo", ""); setF("tipo_fondo_otro", "") }}>
                  <option value="">Seleccionar financiador...</option>
                  {Object.keys(FONDOS).map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                {form.financiador && form.financiador !== "Otro" && (
                  <select className="input mt-2" value={form.tipo_fondo} onChange={(e) => setF("tipo_fondo", e.target.value)}>
                    <option value="">Seleccionar tipo de fondo...</option>
                    {FONDOS[form.financiador].map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                )}
                {form.financiador === "Otro" && (
                  <input className="input mt-2" placeholder="Especificar tipo de fondo..."
                    value={form.tipo_fondo_otro}
                    onChange={(e) => { setF("tipo_fondo_otro", e.target.value); setF("tipo_fondo", "__otro__") }} />
                )}
              </Campo>

              <Campo label="Ubicación del proyecto">
                <UbicacionMapa
                  value={form.ubicacion}
                  onChange={(addr) => setF("ubicacion", addr)}
                />
              </Campo>

              <Campo label="Estado del proyecto *">
                <div className="grid grid-cols-2 gap-2">
                  {ESTADOS.map((e) => (
                    <button key={e.label} onClick={() => setF("estado", e.label)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl border-2 transition-all ${form.estado === e.label ? "border-amber-400 bg-amber-50" : "border-gray-100 hover:border-amber-200"}`}>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_COLORES[e.label]}`}>{e.label}</span>
                      <span className="text-xs text-gray-400 font-medium">{e.pct}%</span>
                    </button>
                  ))}
                </div>
                {form.estado && (
                  <div className="mt-3 bg-gray-50 rounded-xl p-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <span>Avance automático según estado</span>
                      <span className="font-semibold text-amber-600">{pctAvance}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${pctAvance}%` }} />
                    </div>
                  </div>
                )}
              </Campo>

              <div className="grid grid-cols-2 gap-3">
                <Campo label="Fecha de inicio">
                  <input type="date" className="input" value={form.fecha_inicio} onChange={(e) => setF("fecha_inicio", e.target.value)} />
                </Campo>
                <Campo label="Fecha de cierre">
                  <input type="date" className="input" value={form.fecha_cierre} onChange={(e) => setF("fecha_cierre", e.target.value)} />
                </Campo>
              </div>

              <Campo label="Prioridad del proyecto">
                <div className="flex gap-2">
                  {[
                    ["Alta", "border-red-400 bg-red-50 text-red-700"],
                    ["Media", "border-yellow-400 bg-yellow-50 text-yellow-700"],
                    ["Baja", "border-green-400 bg-green-50 text-green-700"],
                  ].map(([p, activeCls]) => (
                    <button key={p} onClick={() => setF("prioridad", p)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${form.prioridad === p ? activeCls : "border-gray-100 text-gray-400 hover:border-gray-200"}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </Campo>

              <Campo label="Encargado del proyecto">
                <input className="input" placeholder="Nombre del encargado o responsable"
                  value={form.encargado} onChange={(e) => setF("encargado", e.target.value)} />
              </Campo>


              <Campo label="Foto del proyecto (opcional)">
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-blue-300 transition-colors">
                  {imagenPreview ? (
                    <div className="relative">
                      <img src={imagenPreview} alt="preview"
                        className="w-full h-36 object-cover rounded-lg mb-2" />
                      <button type="button"
                        onClick={() => { setImagenPreview(""); setImagenFile(null); setF("imagen_url", "") }}
                        className="text-xs text-red-500 hover:text-red-700">✕ Quitar imagen</button>
                    </div>
                  ) : (
                    <>
                      <div className="text-3xl mb-2">🖼️</div>
                      <p className="text-xs text-gray-400 mb-2">Sube una foto del proyecto</p>
                    </>
                  )}
                  <input type="file" accept="image/*" id="img-editar"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files[0]
                      if (!file) return
                      setImagenFile(file)
                      setImagenPreview(URL.createObjectURL(file))
                    }} />
                  <label htmlFor="img-editar"
                    className="inline-block mt-1 px-4 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-600 cursor-pointer transition-colors">
                    {subiendo ? "Subiendo..." : "Seleccionar imagen"}
                  </label>
                </div>
              </Campo>

              <Campo label="Link al Drive del proyecto">
                <input className="input" placeholder="https://drive.google.com/drive/folders/..."
                  value={form.link_drive} onChange={(e) => setF("link_drive", e.target.value)} />
              </Campo>
            </div>
          )}

          {/* ─── PASO 3: FINANCIAMIENTO ─── */}
          {paso === 3 && (
            <div className="space-y-5">

              {[
                ["presupuesto", "moneda_presupuesto", "Presupuesto máximo", "Monto máximo que puede financiar el organismo"],
                ["monto_cotizado", "moneda_cotizado", "Monto cotizado", "Lo que necesitamos para ejecutar el proyecto"],
                ["monto_asignado", "moneda_asignado", "Monto asignado", "Lo que finalmente fue asignado al proyecto"],
              ].map(([key, monedaKey, label, hint]) => (
                <Campo key={key} label={label}>
                  <div className="flex gap-2">
                    <div className="flex border border-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                      {[["$", "CLP"], ["UTM", "UTM"]].map(([sym, val]) => (
                        <button key={val} type="button"
                          onClick={() => setF(monedaKey, val)}
                          className={`px-3 py-2 text-sm font-semibold transition-all ${form[monedaKey] === val ? "bg-slate-900 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}>
                          {sym}
                        </button>
                      ))}
                    </div>
                    <input className="input flex-1" placeholder="0" type="number" min="0"
                      value={form[key]} onChange={(e) => setF(key, e.target.value)} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{hint}</p>
                </Campo>
              ))}

              {(form.presupuesto || form.monto_cotizado || form.monto_asignado) && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-3">Resumen financiero</p>
                  <div className="space-y-2">
                    {[
                      ["Presupuesto máx.", form.presupuesto, form.moneda_presupuesto],
                      ["Monto cotizado",   form.monto_cotizado, form.moneda_cotizado],
                      ["Monto asignado",   form.monto_asignado, form.moneda_asignado],
                    ].map(([l, v, m]) => v ? (
                      <div key={l} className="flex justify-between text-sm">
                        <span className="text-amber-700">{l}</span>
                        <span className="font-semibold text-amber-900">
                          {m === "CLP" ? `$${Number(v).toLocaleString("es-CL")}` : `${Number(v).toLocaleString("es-CL")} UTM`}
                        </span>
                      </div>
                    ) : null)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mb-1 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 gap-3">
          <button onClick={() => paso > 1 ? setPaso((p) => p - 1) : onCerrar()}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
            {paso === 1 ? "Cancelar" : "← Anterior"}
          </button>
          {paso < 3 ? (
            <button onClick={() => setPaso((p) => p + 1)}
              className="px-6 py-2 text-sm font-medium bg-amber-400 hover:bg-amber-500 text-white rounded-xl transition-all shadow-sm">
              Siguiente →
            </button>
          ) : (
            <button onClick={guardar} disabled={guardando}
              className="px-6 py-2 text-sm font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all shadow-sm disabled:opacity-50">
              {guardando ? "Guardando..." : "Guardar cambios ✓"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Campo({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  )
}