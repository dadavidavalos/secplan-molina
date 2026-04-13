import { useState } from "react";
import { supabase } from "./supabase";

const FONDOS = {
  GORE: ["FNDR", "FRIL", "-5000 UTM", "Circular 33", "FNDR 8% (Subvenciones actividades)", "Financiamiento para Programas", "FRPD"],
  SUBDERE: ["PMU (Mejoramiento Urbano)", "PMB (Mejoramiento de Barrios)", "PTRAC (Tenencia Responsable)", "PRBIPE (Revitalización de Barrios)"],
  "Fondos Sectoriales": ["MINVU - Pavimentación Participativa", "MINVU - Espacios Públicos"],
  "Municipal (Fondos Propios)": ["Presupuesto Municipal"],
  Otro: ["__otro__"],
};

const ESTADOS = [
  { label: "Idea", pct: 5 },
  { label: "Formulación", pct: 15 },
  { label: "Postulación", pct: 30 },
  { label: "Aprobado", pct: 50 },
  { label: "Licitación", pct: 65 },
  { label: "Adjudicado", pct: 80 },
  { label: "Finalizado", pct: 100 },
];

const ESTADO_COLORES = {
  Idea: "bg-gray-100 text-gray-700",
  Formulación: "bg-yellow-100 text-yellow-800",
  Postulación: "bg-blue-100 text-blue-800",
  Aprobado: "bg-green-100 text-green-800",
  Licitación: "bg-purple-100 text-purple-800",
  Adjudicado: "bg-orange-100 text-orange-800",
  Finalizado: "bg-indigo-100 text-indigo-800",
};

const INITIAL = {
  tipo_iniciativa: "Proyecto",
  nombre: "",
  descripcion: "",
  financiador: "",
  tipo_fondo: "",
  tipo_fondo_otro: "",
  moneda: "CLP",
  presupuesto: "",
  monto_cotizado: "",
  monto_asignado: "",
  ubicacion: "",
  estado: "",
  fecha_inicio: "",
  fecha_cierre: "",
  prioridad: "Media",
  link_drive: "",
  encargado: "",
  ficha_iniciativas_previas: null,
  ficha_inscripcion_cbr: null,
  ficha_rol_avaluo: null,
  ficha_propiedad_municipal: null,
  ficha_comodato: null,
  ficha_permiso_edificacion: null,
  ficha_tipo_terreno: "",
  ficha_ifc: null,
  ficha_zonificacion: null,
  ficha_pladeco: null,
};

export default function AgregarProyecto({ onClose, onGuardado }) {
  const [form, setForm] = useState(INITIAL);
  const [paso, setPaso] = useState(1);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const estadoActual = ESTADOS.find((e) => e.label === form.estado);
  const pctAvance = estadoActual?.pct ?? 0;

  const fichaViable = (() => {
    if (form.ficha_iniciativas_previas === true) return null;
    if (form.ficha_inscripcion_cbr === false) return false;
    if (form.ficha_rol_avaluo === false) return false;
    if (form.ficha_propiedad_municipal === false && form.ficha_comodato === false) return false;
    if (form.ficha_permiso_edificacion === true) {
      if (form.ficha_tipo_terreno === "rural" && form.ficha_ifc === false) return false;
      if (form.ficha_tipo_terreno === "urbano" && form.ficha_zonificacion === false) return false;
    }
    if (form.ficha_pladeco === false) return false;
    if (form.ficha_pladeco === true) return true;
    return null;
  })();

  const guardar = async () => {
    if (!form.nombre.trim()) { setError("El nombre del proyecto es obligatorio."); return; }
    if (!form.estado) { setError("Selecciona un estado para el proyecto."); return; }
    setGuardando(true);
    setError("");
    const tipoFondoFinal = form.tipo_fondo === "__otro__" ? form.tipo_fondo_otro : form.tipo_fondo;
    const { error: err } = await supabase.from("Proyectos").insert([{
      tipo_iniciativa: form.tipo_iniciativa,
      nombre: form.nombre,
      descripcion: form.descripcion,
      financiador: form.financiador,
      fondo: tipoFondoFinal,
      moneda: form.moneda,
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
    }]);
    setGuardando(false);
    if (err) { setError("Error al guardar: " + err.message); return; }
    onGuardado?.();
    onClose();
  };

  const mapsUrl = form.ubicacion
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(form.ubicacion)}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Nuevo Proyecto</h2>
            <p className="text-xs text-gray-400 mt-0.5">Paso {paso} de 3</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-light leading-none">✕</button>
        </div>

        {/* Barra de progreso */}
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

        {/* Scroll area */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

          {/* ─── PASO 1: FICHA EVALUACIÓN ─── */}
          {paso === 1 && (
            <div className="space-y-5">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-amber-800">Ficha de Evaluación de Iniciativa</p>
                <p className="text-xs text-amber-600 mt-1">Evalúa toda iniciativa antes de formularla. Responde las preguntas para determinar su viabilidad.</p>
              </div>

              <RadioGrupo
                label="¿Se han llevado a cabo iniciativas en el terreno en los últimos 2 años?"
                value={form.ficha_iniciativas_previas}
                onChange={(v) => set("ficha_iniciativas_previas", v)}
              />
              {form.ficha_iniciativas_previas === true && (
                <Alerta tipo="warning" texto="Deberá evaluar la iniciativa y cumplir con los plazos de presentación antes de continuar." />
              )}

              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Legalidad del terreno</p>
                <div className="space-y-4">
                  <RadioGrupo label="1. ¿El terreno cuenta con inscripción en CBR?" value={form.ficha_inscripcion_cbr} onChange={(v) => set("ficha_inscripcion_cbr", v)} />
                  <RadioGrupo label="2. ¿El terreno cuenta con Rol de avalúo vigente?" value={form.ficha_rol_avaluo} onChange={(v) => set("ficha_rol_avaluo", v)} />
                  <RadioGrupo label="3. ¿El terreno es de propiedad Municipal?" value={form.ficha_propiedad_municipal} onChange={(v) => set("ficha_propiedad_municipal", v)} />
                  {form.ficha_propiedad_municipal === false && (
                    <div className="ml-4 pl-3 border-l-2 border-gray-200">
                      <RadioGrupo label="3.1 ¿El propietario está dispuesto a efectuar comodato o usufructo?" value={form.ficha_comodato} onChange={(v) => set("ficha_comodato", v)} />
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Cumplimiento de normas</p>
                <div className="space-y-4">
                  <RadioGrupo label="1. ¿El proyecto contará con permiso de edificación?" value={form.ficha_permiso_edificacion} onChange={(v) => set("ficha_permiso_edificacion", v)} />
                  {form.ficha_permiso_edificacion === true && (
                    <div className="ml-4 pl-3 border-l-2 border-gray-200 space-y-4">
                      <div>
                        <p className="text-sm text-gray-700 mb-2">El terreno es:</p>
                        <div className="flex gap-3">
                          {["Urbano", "Rural"].map((t) => (
                            <button key={t} onClick={() => set("ficha_tipo_terreno", t.toLowerCase())}
                              className={`px-5 py-2 rounded-lg text-sm font-medium border transition-all ${form.ficha_tipo_terreno === t.toLowerCase() ? "bg-amber-400 border-amber-400 text-white" : "border-gray-200 text-gray-600 hover:border-amber-300"}`}>
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                      {form.ficha_tipo_terreno === "rural" && (
                        <RadioGrupo label="¿El terreno cuenta con IFC?" value={form.ficha_ifc} onChange={(v) => set("ficha_ifc", v)} />
                      )}
                      {form.ficha_tipo_terreno === "urbano" && (
                        <RadioGrupo label="¿El terreno cumple con la zonificación para el diseño?" value={form.ficha_zonificacion} onChange={(v) => set("ficha_zonificacion", v)} />
                      )}
                    </div>
                  )}
                  <RadioGrupo label="2. ¿El proyecto está dentro de las iniciativas de financiamiento y del Pladeco?" value={form.ficha_pladeco} onChange={(v) => set("ficha_pladeco", v)} />
                </div>
              </div>

              {fichaViable === true && <Alerta tipo="success" texto="✓ La iniciativa es viable para estudio." />}
              {fichaViable === false && <Alerta tipo="error" texto="✗ La iniciativa no cumple los requisitos actuales. Revisar los puntos marcados con No." />}
            </div>
          )}

          {/* ─── PASO 2: DATOS DEL PROYECTO ─── */}
          {paso === 2 && (
            <div className="space-y-4">

              <Campo label="Tipo de iniciativa">
                <div className="flex gap-3">
                  {["Proyecto", "Programa"].map((t) => (
                    <button key={t} onClick={() => set("tipo_iniciativa", t)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${form.tipo_iniciativa === t ? "bg-slate-900 border-slate-900 text-white" : "border-gray-200 text-gray-600 hover:border-slate-300"}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </Campo>

              <Campo label="Nombre del proyecto *">
                <input className="input" placeholder="Ej: Construcción sede social Población Las Rosas" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} />
              </Campo>

              <Campo label="Descripción">
                <textarea className="input min-h-[80px] resize-none" placeholder="Describe brevemente en qué consiste el proyecto..." value={form.descripcion} onChange={(e) => set("descripcion", e.target.value)} />
              </Campo>

              <Campo label="Financiador y tipo de fondo">
                <select className="input" value={form.financiador} onChange={(e) => { set("financiador", e.target.value); set("tipo_fondo", ""); set("tipo_fondo_otro", ""); }}>
                  <option value="">Seleccionar financiador...</option>
                  {Object.keys(FONDOS).map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                {form.financiador && form.financiador !== "Otro" && (
                  <select className="input mt-2" value={form.tipo_fondo} onChange={(e) => set("tipo_fondo", e.target.value)}>
                    <option value="">Seleccionar tipo de fondo...</option>
                    {FONDOS[form.financiador].map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                )}
                {form.financiador === "Otro" && (
                  <input className="input mt-2" placeholder="Especificar tipo de fondo..." value={form.tipo_fondo_otro} onChange={(e) => { set("tipo_fondo_otro", e.target.value); set("tipo_fondo", "__otro__"); }} />
                )}
              </Campo>

              <Campo label="Ubicación del proyecto">
                <div className="relative">
                  <input className="input pr-10" placeholder="Ej: Av. O'Higgins 450, Molina, Maule" value={form.ubicacion} onChange={(e) => set("ubicacion", e.target.value)} />
                  {mapsUrl && (
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700" title="Ver en Google Maps">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </a>
                  )}
                </div>
                {mapsUrl && (
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline mt-1 inline-block">
                    Ver en Google Maps →
                  </a>
                )}
              </Campo>

              <Campo label="Estado del proyecto *">
                <div className="grid grid-cols-2 gap-2">
                  {ESTADOS.map((e) => (
                    <button key={e.label} onClick={() => set("estado", e.label)}
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
                  <input type="date" className="input" value={form.fecha_inicio} onChange={(e) => set("fecha_inicio", e.target.value)} />
                </Campo>
                <Campo label="Fecha de cierre">
                  <input type="date" className="input" value={form.fecha_cierre} onChange={(e) => set("fecha_cierre", e.target.value)} />
                </Campo>
              </div>

              <Campo label="Prioridad del proyecto">
                <div className="flex gap-2">
                  {[
                    ["Alta", "border-red-400 bg-red-50 text-red-700"],
                    ["Media", "border-yellow-400 bg-yellow-50 text-yellow-700"],
                    ["Baja", "border-green-400 bg-green-50 text-green-700"],
                  ].map(([p, activeCls]) => (
                    <button key={p} onClick={() => set("prioridad", p)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${form.prioridad === p ? activeCls : "border-gray-100 text-gray-400 hover:border-gray-200"}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </Campo>

              <Campo label="Encargado del proyecto">
                <input className="input" placeholder="Nombre del encargado o responsable" value={form.encargado} onChange={(e) => set("encargado", e.target.value)} />
              </Campo>

              <Campo label="Link al Drive del proyecto">
                <input className="input" placeholder="https://drive.google.com/drive/folders/..." value={form.link_drive} onChange={(e) => set("link_drive", e.target.value)} />
              </Campo>
            </div>
          )}

          {/* ─── PASO 3: FINANCIAMIENTO ─── */}
          {paso === 3 && (
            <div className="space-y-5">
              <Campo label="Moneda">
                <div className="flex gap-3">
                  {[["CLP", "Pesos chilenos ($)"], ["UTM", "Unidades Tributarias (UTM)"]].map(([v, label]) => (
                    <button key={v} onClick={() => set("moneda", v)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${form.moneda === v ? "bg-slate-900 border-slate-900 text-white" : "border-gray-200 text-gray-600 hover:border-slate-300"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </Campo>

              {[
                ["presupuesto", "Presupuesto máximo", "Monto máximo que puede financiar el organismo"],
                ["monto_cotizado", "Monto cotizado", "Lo que necesitamos para ejecutar el proyecto"],
                ["monto_asignado", "Monto asignado", "Lo que finalmente fue asignado al proyecto"],
              ].map(([key, label, hint]) => (
                <Campo key={key} label={`${label} (${form.moneda === "CLP" ? "$" : "UTM"})`}>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                      {form.moneda === "CLP" ? "$" : "UTM"}
                    </span>
                    <input className="input pl-10" placeholder="0" type="number" min="0"
                      value={form[key]} onChange={(e) => set(key, e.target.value)} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{hint}</p>
                </Campo>
              ))}

              {(form.presupuesto || form.monto_cotizado || form.monto_asignado) && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-3">Resumen financiero</p>
                  <div className="space-y-2">
                    {[
                      ["Presupuesto máx.", form.presupuesto],
                      ["Monto cotizado", form.monto_cotizado],
                      ["Monto asignado", form.monto_asignado],
                    ].map(([l, v]) => v ? (
                      <div key={l} className="flex justify-between text-sm">
                        <span className="text-amber-700">{l}</span>
                        <span className="font-semibold text-amber-900">
                          {form.moneda === "CLP"
                            ? `$${Number(v).toLocaleString("es-CL")}`
                            : `${Number(v).toLocaleString("es-CL")} UTM`}
                        </span>
                      </div>
                    ) : null)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {error && (
          <div className="mx-6 mb-1 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}
        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 gap-3">
          <button
            onClick={() => paso > 1 ? setPaso((p) => p - 1) : onClose()}
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
              className="px-6 py-2 text-sm font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
              {guardando ? "Guardando..." : "Guardar proyecto ✓"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Helpers ──
function Campo({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function RadioGrupo({ label, value, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1">
      <p className="text-sm text-gray-700 flex-1 leading-snug">{label}</p>
      <div className="flex gap-2 flex-shrink-0">
        {[["Sí", true], ["No", false]].map(([l, v]) => (
          <button key={l} onClick={() => onChange(v)}
            className={`w-12 py-1.5 rounded-lg text-sm font-medium border transition-all ${
              value === v
                ? v ? "bg-green-500 border-green-500 text-white" : "bg-red-500 border-red-500 text-white"
                : "border-gray-200 text-gray-500 hover:border-gray-400"
            }`}>
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

function Alerta({ tipo, texto }) {
  const cls = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-700",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  }[tipo];
  return (
    <div className={`border rounded-xl p-3 text-sm font-medium ${cls}`}>{texto}</div>
  );
}