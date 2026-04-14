import { useState } from "react";

// Logo Municipalidad de Molina (base64 directo, sin dependencia externa)
const LOGO_MOLINA = "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";

export function calcularViabilidad(f) {
  // Si el tipo no es Gobierno Regional, la sección de iniciativas previas no aplica
  if (f.tipo_organismo === "GORE") {
    if (f.iniciativas_previas === true) return null;
  }
  if (f.cbr === false) return false;
  if (f.rol_avaluo === false) return false;
  if (f.propiedad_municipal === false && f.comodato === false) return false;
  if (f.permiso_edificacion === true) {
    if (f.tipo_terreno === "rural" && f.ifc === false) return false;
    if (f.tipo_terreno === "urbano" && f.zonificacion === false) return false;
  }
  if (f.pladeco === false) return false;
  if (f.pladeco === true) return true;
  return null;
}

function descargarWord(ficha) {
  const viable = calcularViabilidad(ficha);
  const si = (v) => v === true ? "☑ Sí   ☐ No" : v === false ? "☐ Sí   ☑ No" : "☐ Sí   ☐ No";
  const organismos = { SUBDERE: "SUBDERE", GORE: "Gobierno Regional", Municipal: "Municipal" };

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  body{font-family:Arial,sans-serif;font-size:11pt;margin:2cm;color:#111}
  .header{display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #333;padding-bottom:8px;margin-bottom:12px}
  img{height:44px;object-fit:contain}
  h1{text-align:center;font-size:14pt;text-decoration:underline;margin:8px 0 2px}
  .sub{text-align:center;font-size:9.5pt;font-style:italic;text-decoration:underline;margin-bottom:10px}
  .org-row{display:flex;justify-content:center;gap:32px;font-weight:bold;font-size:12pt;margin-bottom:10px}
  .org-sel{border-bottom:2px solid #111;padding-bottom:1px}
  .seccion{font-weight:bold;font-size:11pt;margin:14px 0 6px;display:flex;align-items:center;gap:6px}
  .bullet{width:12px;height:12px;background:#111;border-radius:50%;display:inline-block}
  .fila{display:flex;justify-content:space-between;align-items:flex-start;margin:5px 0;gap:12px}
  .pregunta{flex:1}
  .resp{white-space:nowrap;font-weight:bold}
  .nota{font-size:8.5pt;color:#555;font-style:italic;margin:3px 0 3px 12px}
  .sub-bloque{margin-left:18px;border-left:2px solid #ccc;padding-left:10px}
  .resultado{margin-top:18px;font-weight:bold;border:2px solid #333;padding:8px 12px;text-align:center;font-size:11pt}
  .pie{margin-top:18px;border-top:1px solid #aaa;padding-top:10px;display:flex;gap:32px}
  .campo{flex:1;border-bottom:1px solid #333;padding-bottom:1px}
  .campo-label{font-size:8pt;color:#666}
</style></head><body>
<div class="header">
  <img src="data:image/jpeg;base64,${LOGO_MOLINA}" alt="Municipalidad de Molina"/>
  <div style="text-align:right;font-size:9pt;color:#555">${ficha.fecha || ""}</div>
</div>
<h1>FICHA EVALUACIÓN INICIATIVA</h1>
<div class="sub">Se deberá evaluar cualquier iniciativa a proyecto de acuerdo con lo siguiente:</div>
<div class="org-row">
  <span ${ficha.tipo_organismo === "SUBDERE" ? 'class="org-sel"' : ""}>SUBDERE</span>
  <span ${ficha.tipo_organismo === "GORE" ? 'class="org-sel"' : ""}>GOBIERNO REGIONAL</span>
  <span ${ficha.tipo_organismo === "Municipal" ? 'class="org-sel"' : ""}>MUNICIPAL</span>
</div>

${ficha.tipo_organismo === "GORE" ? `
<div style="background:#f0f4ff;border:1px solid #b0c4f0;padding:8px 12px;margin-bottom:10px;font-size:9.5pt;font-style:italic">
  (Si la iniciativa es al Gobierno Regional responder lo siguiente)
</div>
<div class="fila">
  <span class="pregunta">En el terreno a presentar proyecto se han llevado a cabo iniciativas dentro de los últimos 2 años</span>
  <span class="resp">${si(ficha.iniciativas_previas)}</span>
</div>
${ficha.iniciativas_previas === true ? `<div class="nota">Si la respuesta anterior es Sí se deberá evaluar la iniciativa y cumplir con las disposiciones de plazo para la presentación y esperar el plazo determinado. Si es No se puede continuar.</div>` : ""}
` : ""}

<div class="seccion"><span class="bullet"></span> Legalidad del terreno:</div>
<div class="fila"><span class="pregunta">1.- Terreno cuenta con inscripción en CBR</span><span class="resp">${si(ficha.cbr)}</span></div>
<div class="fila"><span class="pregunta">2.- Terreno cuenta con Rol de avalúo vigente</span><span class="resp">${si(ficha.rol_avaluo)}</span></div>
<div class="fila"><span class="pregunta">3.- Terreno es de propiedad Municipal</span><span class="resp">${si(ficha.propiedad_municipal)}</span></div>
${ficha.propiedad_municipal === false ? `
<div class="sub-bloque">
  <div class="fila"><span class="pregunta">3.1 Si la respuesta es No, ¿el propietario está dispuesto a efectuar comodato o usufructo?</span><span class="resp">${si(ficha.comodato)}</span></div>
</div>` : ""}
<div class="nota">Si cualquiera de las respuestas anteriores es No, se deberá evaluar la iniciativa y cumplir con las disposiciones anteriores para comenzar el diseño o la evaluación.</div>

<div class="seccion"><span class="bullet"></span> Cumplimiento de normas:</div>
<div class="fila"><span class="pregunta">1.- El proyecto deberá contar con permiso de edificación</span><span class="resp">${si(ficha.permiso_edificacion)}</span></div>
${ficha.permiso_edificacion === false ? `<div class="nota">Si la respuesta es No se pasa al punto 2.</div>` : ""}
${ficha.permiso_edificacion === true ? `
<div class="sub-bloque">
  <div class="fila"><span class="pregunta">El terreno es:</span>
  <span class="resp">${ficha.tipo_terreno === "urbano" ? "☑ Urbano  ☐ Rural" : ficha.tipo_terreno === "rural" ? "☐ Urbano  ☑ Rural" : "☐ Urbano  ☐ Rural"}</span></div>
  ${ficha.tipo_terreno === "rural" ? `
    <div class="fila"><span class="pregunta">Si es Rural, ¿cuenta con IFC?</span><span class="resp">${si(ficha.ifc)}</span></div>
    ${ficha.ifc === false ? `<div class="nota">Si no cuenta con IFC se debe tramitar antes de presentar la iniciativa.</div>` : ""}
  ` : ""}
  ${ficha.tipo_terreno === "urbano" ? `
    <div class="fila"><span class="pregunta">Si el terreno es urbano, ¿cumple con la zonificación para el diseño?</span><span class="resp">${si(ficha.zonificacion)}</span></div>
  ` : ""}
</div>` : ""}
<div class="fila"><span class="pregunta">2.- El proyecto se encuentra dentro de las iniciativas de financiamiento y dentro del Pladeco</span><span class="resp">${si(ficha.pladeco)}</span></div>

<div class="resultado">${
  viable === true ? "✅ Si se llega a la última respuesta con un Sí, la iniciativa es VIABLE para estudio." :
  viable === false ? "❌ La iniciativa NO cumple los requisitos actuales para continuar." :
  "Si se llega a la última respuesta con un Sí, la iniciativa es viable para estudio."
}</div>

<div class="pie">
  <div class="campo"><div class="campo-label">Proyecto / Iniciativa</div>${ficha.nombre_proyecto || "_________________________"}</div>
  <div class="campo"><div class="campo-label">Responsable</div>${ficha.responsable || "_________________________"}</div>
  <div class="campo"><div class="campo-label">Fecha</div>${ficha.fecha || "_______________"}</div>
</div>
</body></html>`;

  const blob = new Blob([html], { type: "application/msword;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Ficha_Evaluacion_${(ficha.nombre_proyecto || "Iniciativa").replace(/\s+/g, "_")}.doc`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function FichaEvaluacion({ ficha: fichaExterna, onChange, nombreProyecto }) {
  const [fichaInterna, setFichaInterna] = useState({
    tipo_organismo: "",
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
    nombre_proyecto: nombreProyecto || "",
    responsable: "",
    fecha: new Date().toLocaleDateString("es-CL"),
  });

  const f = fichaExterna || fichaInterna;
  const setF = onChange || ((fn) => setFichaInterna((prev) => fn(prev)));
  const set = (k, v) => setF((prev) => ({ ...prev, [k]: v }));

  const viable = calcularViabilidad(f);

  return (
    <div className="space-y-4">
      {/* Encabezado fiel al documento */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">

        {/* Header con logo */}
        <div className="bg-white px-5 py-3 flex items-center justify-between border-b border-gray-200">
          <img
            src={`data:image/jpeg;base64,${LOGO_MOLINA}`}
            alt="Municipalidad de Molina"
            className="h-10 object-contain"
            onError={(e) => { e.target.style.display = "none"; }}
          />
          <div className="text-right">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Ficha Evaluación Iniciativa</p>
            <p className="text-xs text-gray-400">SECPLAN — Municipalidad de Molina</p>
          </div>
        </div>

        <div className="bg-gray-50 px-5 py-3 border-b border-gray-100">
          <p className="text-xs text-gray-500 italic text-center mb-3">
            Se deberá evaluar cualquier iniciativa a proyecto de acuerdo con lo siguiente:
          </p>

          {/* Selector de organismo — opciones clicables */}
          <div className="flex justify-center gap-3">
            {[
              { key: "SUBDERE", label: "SUBDERE" },
              { key: "GORE", label: "Gobierno Regional" },
              { key: "Municipal", label: "Municipal" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => set("tipo_organismo", key)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold border-2 transition-all ${
                  f.tipo_organismo === key
                    ? "bg-slate-900 border-slate-900 text-white"
                    : "border-gray-300 text-gray-600 hover:border-slate-500"
                }`}>
                {label}
              </button>
            ))}
          </div>
          {!f.tipo_organismo && (
            <p className="text-xs text-amber-600 text-center mt-2">Selecciona el tipo de organismo al que se postula</p>
          )}
        </div>

        <div className="px-5 py-4 bg-white space-y-5">

          {/* Sección GORE: iniciativas previas — solo si es Gobierno Regional */}
          {f.tipo_organismo === "GORE" && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
              <p className="text-xs text-blue-700 italic">
                (Si la iniciativa es al Gobierno Regional responder lo siguiente)
              </p>
              <RadioDoc
                label="En el terreno a presentar proyecto se han llevado a cabo iniciativas dentro de los últimos 2 años"
                value={f.iniciativas_previas}
                onChange={(v) => set("iniciativas_previas", v)}
              />
              {f.iniciativas_previas === true && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
                  Se deberá evaluar la iniciativa y cumplir con las disposiciones de plazo para la presentación y esperar el plazo determinado. Si es No se puede continuar.
                </div>
              )}
            </div>
          )}

          {/* Legalidad del terreno */}
          <div>
            <p className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 bg-slate-800 text-white rounded-full text-xs flex items-center justify-center flex-shrink-0">●</span>
              Legalidad del terreno
            </p>
            <div className="space-y-3 pl-7">
              <RadioDoc label="1.- Terreno cuenta con inscripción en CBR" value={f.cbr} onChange={(v) => set("cbr", v)} />
              <RadioDoc label="2.- Terreno cuenta con Rol de avalúo vigente" value={f.rol_avaluo} onChange={(v) => set("rol_avaluo", v)} />
              <RadioDoc label="3.- Terreno es de propiedad Municipal" value={f.propiedad_municipal} onChange={(v) => set("propiedad_municipal", v)} />
              {f.propiedad_municipal === false && (
                <div className="ml-4 pl-3 border-l-2 border-gray-300">
                  <RadioDoc
                    label="3.1 Si la respuesta es No, ¿el propietario está dispuesto a efectuar comodato o usufructo?"
                    value={f.comodato}
                    onChange={(v) => set("comodato", v)}
                  />
                </div>
              )}
              <p className="text-xs text-gray-500 italic">
                Si cualquiera de las respuestas anteriores es No, se deberá evaluar la iniciativa y cumplir con las disposiciones anteriores para comenzar el diseño o la evaluación.
              </p>
            </div>
          </div>

          {/* Cumplimiento de normas */}
          <div>
            <p className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 bg-slate-800 text-white rounded-full text-xs flex items-center justify-center flex-shrink-0">●</span>
              Cumplimiento de normas
            </p>
            <div className="space-y-3 pl-7">
              <RadioDoc
                label="1.- El proyecto deberá contar con permiso de edificación"
                value={f.permiso_edificacion}
                onChange={(v) => set("permiso_edificacion", v)}
              />
              {f.permiso_edificacion === false && (
                <p className="text-xs text-gray-500 italic ml-2">Si la respuesta es No se pasa al punto 2.</p>
              )}
              {f.permiso_edificacion === true && (
                <div className="ml-4 pl-3 border-l-2 border-gray-300 space-y-3">
                  <div>
                    <p className="text-sm text-gray-700 mb-2">El terreno es:</p>
                    <div className="flex gap-3">
                      {["Urbano", "Rural"].map((t) => (
                        <button key={t} onClick={() => set("tipo_terreno", t.toLowerCase())}
                          className={`px-5 py-1.5 rounded-lg text-sm font-medium border-2 transition-all ${
                            f.tipo_terreno === t.toLowerCase()
                              ? "bg-amber-400 border-amber-400 text-white"
                              : "border-gray-200 text-gray-600 hover:border-amber-300"
                          }`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  {f.tipo_terreno === "rural" && (
                    <>
                      <RadioDoc label="¿El terreno cuenta con IFC?" value={f.ifc} onChange={(v) => set("ifc", v)} />
                      {f.ifc === false && (
                        <p className="text-xs text-gray-500 italic">Si no cuenta con IFC se debe tramitar antes de presentar la iniciativa.</p>
                      )}
                    </>
                  )}
                  {f.tipo_terreno === "urbano" && (
                    <RadioDoc
                      label="¿El terreno cumple con la zonificación para el diseño?"
                      value={f.zonificacion}
                      onChange={(v) => set("zonificacion", v)}
                    />
                  )}
                </div>
              )}
              <RadioDoc
                label="2.- El proyecto se encuentra dentro de las iniciativas de financiamiento y dentro del Pladeco"
                value={f.pladeco}
                onChange={(v) => set("pladeco", v)}
              />
            </div>
          </div>

          {/* Resultado viabilidad */}
          {viable === true && (
            <div className="bg-green-50 border-2 border-green-400 rounded-xl p-4 text-center">
              <p className="text-sm font-bold text-green-800">✅ Si se llega a la última respuesta con un Sí, la iniciativa es viable para estudio.</p>
            </div>
          )}
          {viable === false && (
            <div className="bg-red-50 border-2 border-red-400 rounded-xl p-4 text-center">
              <p className="text-sm font-bold text-red-800">❌ La iniciativa no cumple los requisitos actuales para continuar.</p>
            </div>
          )}
          {viable === null && f.pladeco === null && (f.tipo_organismo || f.cbr !== null) && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 italic">Si se llega a la última respuesta con un Sí, la iniciativa es viable para estudio.</p>
            </div>
          )}

          {/* Datos del pie de página */}
          <div className="border-t border-gray-200 pt-4 grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Proyecto / Iniciativa</label>
              <input className="input text-sm" value={f.nombre_proyecto || ""} onChange={(e) => set("nombre_proyecto", e.target.value)} placeholder="Nombre..." />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Responsable</label>
              <input className="input text-sm" value={f.responsable || ""} onChange={(e) => set("responsable", e.target.value)} placeholder="Nombre..." />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Fecha</label>
              <input className="input text-sm" value={f.fecha || ""} onChange={(e) => set("fecha", e.target.value)} placeholder="dd/mm/aaaa" />
            </div>
          </div>
        </div>
      </div>

      {/* Botón descarga Word */}
      <button
        onClick={() => descargarWord(f)}
        className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
        ⬇ Descargar ficha como Word (.doc)
      </button>
    </div>
  );
}

function RadioDoc({ label, value, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4 py-0.5">
      <p className="text-sm text-gray-800 flex-1 leading-snug">{label}</p>
      <div className="flex gap-2 flex-shrink-0">
        {[["Sí", true], ["No", false]].map(([l, v]) => (
          <button key={l} onClick={() => onChange(v)}
            className={`w-12 py-1 rounded-lg text-sm font-medium border transition-all ${
              value === v
                ? v ? "bg-green-500 border-green-500 text-white" : "bg-red-500 border-red-500 text-white"
                : "border-gray-300 text-gray-500 hover:border-gray-500"
            }`}>
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}