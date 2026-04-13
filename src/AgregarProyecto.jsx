import { useState } from "react";
import { supabase } from "./supabase";
import FichaEvaluacion, { calcularViabilidad } from "./FichaEvaluacion";
import UbicacionMapa from "./UbicacionMapa";

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

const FICHA_INICIAL = {
  iniciativas_previas: null,
  cbr: null,
  rol_avaluo: null,
  propiedad_municipal: null,
  comodato: null,
  permiso_edificacion: null,
  tipo_terreno: "",
  ifc: null,
  zonificacion: null,
  pladeco: null,
  nombre_proyecto: "",
  responsable: "",
  fecha: new Date().toLocaleDateString("es-CL"),
};

const PROYECTO_INICIAL = {
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
  ubicacion_coords: null,
  estado: "",
  fecha_inicio: "",
  fecha_cierre: "",
  prioridad: "Media",
  link_drive: "",
  encargado: "",
};

export default function AgregarProyecto({ onClose, onGuardado }) {
  const [ficha, setFicha] = useState(FICHA_INICIAL);
  const [proyecto, setProyecto] = useState(PROYECTO_INICIAL);
  const [paso, setPaso] = useState(1);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const setP = (k, v) => setProyecto((f) => ({ ...f, [k]: v }));

  const estadoActual = ESTADOS.find((e) => e.label === proyecto.estado);
  const pctAvance = estadoActual?.pct ?? 0;
  const fichaViable = calcularViabilidad(ficha);

  const guardar = async () => {
    if (!proyecto.nombre.trim()) { setError("El nombre del proyecto es obligatorio."); return; }
    if (!proyecto.estado) { setError("Selecciona un estado para el proyecto."); return; }
    setGuardando(true);
    setError("");

    const tipoFondoFinal = proyecto.tipo_fondo === "__otro__" ? proyecto.tipo_fondo_otro : proyecto.tipo_fondo;

    const { error: err } = await supabase.from("Proyectos").insert([{
      tipo_iniciativa: proyecto.tipo_iniciativa,
      nombre: proyecto.nombre,
      descripcion: proyecto.descripcion,
      financiador: proyecto.financiador,
      fondo: tipoFondoFinal,
      moneda: proyecto.moneda,
      presupuesto: proyecto.presupuesto,
      monto_cotizado: proyecto.monto_cotizado,
      asignado: proyecto.monto_asignado,
      ubicacion: proyecto.ubicacion,
      estado: proyecto.estado,
      avance: pctAvance,
      fecha_inicio: proyecto.fecha_inicio,
      fecha_cierre: proyecto.fecha_cierre,
      prioridad: proyecto.prioridad,
      link_drive: proyecto.link_drive,
      encargado: proyecto.encargado,
      ficha_viable: fichaViable,
    }]);

    setGuardando(false);
    if (err) { setError("Error al guardar: " + err.message); return; }
    onGuardado?.();
    onClose();
  };

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

        {/* Barra pasos */}
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

        {/* Contenido */}
        <div className="overflow-y-auto flex-1 px-6 py-5">

          {/* ─── PASO 1: FICHA ─── */}
          {paso === 1 && (
            <FichaEvaluacion
              ficha={ficha}
              onChange={(fn) => setFicha((prev) => fn(prev))}
              nombreProyecto={proyecto.nombre}
            />
          )}

          {/* ─── PASO 2: DATOS ─── */}
          {paso === 2 && (
            <div className="space-y-4">
              <Campo label="Tipo de iniciativa">
                <div className="flex gap-3">
                  {["Proyecto", "Programa"].map((t) => (
                    <button key={t} onClick={() => setP("tipo_iniciativa", t)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${proyecto.tipo_iniciativa === t ? "bg-slate-900 border-slate-900 text-white" : "border-gray-200 text-gray-600 hover:border-slate-300"}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </Campo>

              <Campo label="Nombre del proyecto *">
                <input className="input" placeholder="Ej: Construcción sede social Población Las Rosas" value={proyecto.nombre} onChange={(e) => setP("nombre", e.target.value)} />
              </Campo>

              <Campo label="Descripción">
                <textarea className="input min-h-[80px] resize-none" placeholder="Describe brevemente el proyecto..." value={proyecto.descripcion} onChange={(e) => setP("descripcion", e.target.value)} />
              </Campo>

              <Campo label="Financiador y tipo de fondo">
                <select className="input" value={proyecto.financiador}
                  onChange={(e) => { setP("financiador", e.target.value); setP("tipo_fondo", ""); setP("tipo_fondo_otro", ""); }}>
                  <option value="">Seleccionar financiador...</option>
                  {Object.keys(FONDOS).map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                {proyecto.financiador && proyecto.financiador !== "Otro" && (
                  <select className="input mt-2" value={proyecto.tipo_fondo} onChange={(e) => setP("tipo_fondo", e.target.value)}>
                    <option value="">Seleccionar tipo de fondo...</option>
                    {FONDOS[proyecto.financiador].map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                )}
                {proyecto.financiador === "Otro" && (
                  <input className="input mt-2" placeholder="Especificar tipo de fondo..." value={proyecto.tipo_fondo_otro}
                    onChange={(e) => { setP("tipo_fondo_otro", e.target.value); setP("tipo_fondo", "__otro__"); }} />
                )}
              </Campo>

              {/* UBICACIÓN CON MAPA */}
              <Campo label="Ubicación del proyecto">
                <UbicacionMapa
                  value={proyecto.ubicacion}
                  onChange={(addr, coords) => {
                    setP("ubicacion", addr);
                    setP("ubicacion_coords", coords);
                  }}
                />
              </Campo>

              <Campo label="Estado del proyecto *">
                <div className="grid grid-cols-2 gap-2">
                  {ESTADOS.map((e) => (
                    <button key={e.label} onClick={() => setP("estado", e.label)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl border-2 transition-all ${proyecto.estado === e.label ? "border-amber-400 bg-amber-50" : "border-gray-100 hover:border-amber-200"}`}>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_COLORES[e.label]}`}>{e.label}</span>
                      <span className="text-xs text-gray-400 font-medium">{e.pct}%</span>
                    </button>
                  ))}
                </div>
                {proyecto.estado && (
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
                  <input type="date" className="input" value={proyecto.fecha_inicio} onChange={(e) => setP("fecha_inicio", e.target.value)} />
                </Campo>
                <Campo label="Fecha de cierre">
                  <input type="date" className="input" value={proyecto.fecha_cierre} onChange={(e) => setP("fecha_cierre", e.target.value)} />
                </Campo>
              </div>

              <Campo label="Prioridad del proyecto">
                <div className="flex gap-2">
                  {[
                    ["Alta", "border-red-400 bg-red-50 text-red-700"],
                    ["Media", "border-yellow-400 bg-yellow-50 text-yellow-700"],
                    ["Baja", "border-green-400 bg-green-50 text-green-700"],
                  ].map(([p, activeCls]) => (
                    <button key={p} onClick={() => setP("prioridad", p)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${proyecto.prioridad === p ? activeCls : "border-gray-100 text-gray-400 hover:border-gray-200"}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </Campo>

              <Campo label="Encargado del proyecto">
                <input className="input" placeholder="Nombre del encargado o responsable" value={proyecto.encargado} onChange={(e) => setP("encargado", e.target.value)} />
              </Campo>

              <Campo label="Link al Drive del proyecto">
                <input className="input" placeholder="https://drive.google.com/drive/folders/..." value={proyecto.link_drive} onChange={(e) => setP("link_drive", e.target.value)} />
              </Campo>
            </div>
          )}

          {/* ─── PASO 3: FINANCIAMIENTO ─── */}
          {paso === 3 && (
            <div className="space-y-5">
              <Campo label="Moneda">
                <div className="flex gap-3">
                  {[["CLP", "Pesos chilenos ($)"], ["UTM", "Unidades Tributarias (UTM)"]].map(([v, label]) => (
                    <button key={v} onClick={() => setP("moneda", v)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${proyecto.moneda === v ? "bg-slate-900 border-slate-900 text-white" : "border-gray-200 text-gray-600 hover:border-slate-300"}`}>
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
                <Campo key={key} label={`${label} (${proyecto.moneda === "CLP" ? "$" : "UTM"})`}>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                      {proyecto.moneda === "CLP" ? "$" : "UTM"}
                    </span>
                    <input className="input pl-10" placeholder="0" type="number" min="0"
                      value={proyecto[key]} onChange={(e) => setP(key, e.target.value)} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{hint}</p>
                </Campo>
              ))}

              {(proyecto.presupuesto || proyecto.monto_cotizado || proyecto.monto_asignado) && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-3">Resumen financiero</p>
                  <div className="space-y-2">
                    {[
                      ["Presupuesto máx.", proyecto.presupuesto],
                      ["Monto cotizado", proyecto.monto_cotizado],
                      ["Monto asignado", proyecto.monto_asignado],
                    ].map(([l, v]) => v ? (
                      <div key={l} className="flex justify-between text-sm">
                        <span className="text-amber-700">{l}</span>
                        <span className="font-semibold text-amber-900">
                          {proyecto.moneda === "CLP"
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
          <button onClick={() => paso > 1 ? setPaso((p) => p - 1) : onClose()}
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
              {guardando ? "Guardando..." : "Guardar proyecto ✓"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Campo({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}