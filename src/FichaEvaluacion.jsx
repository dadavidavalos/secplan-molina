import { useState } from "react";

// Logo SECPLAN en base64
const LOGO_B64 = "iVBORw0KGgoAAAANSUhEUgAAAZwAAAB+CAYAAAAQuqcEAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAIdUAACHVAQSctJ0AAEd9SURBVHhe7Z0JeBzFmfeVPb7sbrJLOOyZISxXiI+ZMWBrxuFIICSEBbKBkIQsOUkIkHCGM4RwmCsJ4SYQwGAwtmZkWz40I58y2MaWZiTbso3v+74PyYdk63Z/T/Xo7an+V/V0dWsky7h/z/N/7Kl6663qmp771Ux3VxUU5ImT+38Y8oVjzwXCxXP9oeKt/nCs+fQBxZoTBULFLYFQfIM/FJvRu3/8+9jHicDJ54440x+OPxEIFVf5w8Vr/QNitYFQrA3nykr+UHx/IBxb5w/HUr1Cox4KBEeciX14eHh49Gh6h4vPD4SKlANflyoUj5/WryiAYzxeCATjPxOO6ZgpdtQfjj3Yq1fJF3GcHh4eHt2KGKB6pgLh2Aoce0/CF4ofxjH3VAXCsZ04fg8PD48u4/Rg7m8zN9/9iTa2bIPW3NKmdSXNzW3aWx+s0C6/fpIwBpkCoeKDeCzHipPPHXoSjg/V56Kx2h+ematt3lqPh55X9uxr1IbFVmk//PXH2pfPF8dhJTwmDw8Pj7wSCMeOYuBpbW3HGHZMOXr0qLZizX4hQPaUQBkIxVtwTExLltfiofQIjhxp1fpcVCKMtyfMpYeHx2cUX6g4xgcbp7S2H9VW7dytzVy9Vxs1f6/22swdWnr9ITTTJnxaq/1u1AZdd4/ZoD01eav2buVu7aOVB7T1exu1o9hAgZ4SKHEcN90+E4eak6aWdm3DvsNa1fq92rTl+7XRNXu1Yend2uuzdmgvTN+iPV++UXtu6kb9/2/N3qXF5u3V5m08pC3dfkjbdbAZ3bni7MLRPWIuPTw8PMPkSjbsW8WrM7YZicKNkLdm7xRscmn5jsP6OKw4e9CxDZS+fvYJu6G5VTgut9qwr9Hk+9V+v9JePOunlmJMX3FA+3jV/pzzyBgxZo1xHP5Q7CE8Vg8PD49OQQHm6h9PNQLPyGpnSUFFyF2jRZtcevGj7ejCgA/4gWB8Nx5jV2KVbB4ct1Q4hs6Ip621TUgsVnqt/y16mx0HmgWfR5rF63HHMnl7eHh8xqHg8knlDow9Bg9P2CQEK7fiYX9xY72dsD3BB0pfeOS9eJxdBfU5OrFeH8fdo/OXaF6dYX5PKl4cIyQUFS0bP0dv/2hys9AHE4+XcDw8PLqMGCB6pgLh2AouvctOfaGQPNyKgbXXeF9eBHtyOSezXaFpv2YPNM0bRiYbBVhBIoUgdWkWqmWmMeG/RhHDpVBB4WHh4eHh5dJoV8KDGcLJwUq0+00Igu2yCLkwmkpXiAcUxqeyBxEpxNZmEwQCQ+hXFD5yTkRFTsxVVP2i4tnfDVMKEfLBBHuLRJ/VXgFU5e5DJQWP5gXE+1QVZL6IMvEHH8dAIlENj54i0MfRlJO5j8AxOKJZaWovFEzL7JM0+qQ0H4KOXH4FHZP0SnwvZBsOT0EexUO9B4G9MaTTGKA4fRvN/yEbK6GCX3+xQ6UWV3c+UxpJVcfZL9fQzXoTGAfhFOQNPWJaT7GUMPJpqxQ3fxAKBz9qhfV6jSUO/4QIxJoU3nX7m1aAHKE70Vq2XcYwZaSAm5fLBTi5lqfJeJrwFd5bJkPIp3neDt3r/B3GYJB4jSYfDc8cBujqTWO7hbDSjBIFMOFOY0fLG7Y7UXjN0d3v2xbmMRIBlhg==";

const INITIAL_FICHA = {
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
  fecha: "",
  responsable: "",
};

// Calcula viabilidad de la ficha
export function calcularViabilidad(f) {
  if (f.iniciativas_previas === true) return null;
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

// Genera y descarga el .docx con las respuestas llenadas
async function descargarWord(ficha) {
  // Usamos docx vía CDN desde el navegador con una librería simple
  // Construimos el contenido como HTML y lo convertimos via blob
  const viable = calcularViabilidad(ficha);
  const si = (v) => v === true ? "☑ Sí  ☐ No" : v === false ? "☐ Sí  ☑ No" : "☐ Sí  ☐ No";

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: Arial, sans-serif; font-size: 11pt; margin: 2cm; }
  h1 { text-align: center; font-size: 14pt; text-decoration: underline; margin-bottom: 4px; }
  .sub { text-align: center; font-size: 10pt; text-decoration: underline; margin-bottom: 16px; }
  .financiadores { text-align: center; font-weight: bold; font-size: 12pt; margin-bottom: 4px; }
  .subtitulo { font-weight: bold; text-decoration: underline; margin-top: 16px; margin-bottom: 6px; }
  .pregunta { margin: 6px 0; }
  .respuesta { font-weight: bold; margin-left: 20px; }
  .nota { font-size: 9pt; color: #555; margin: 4px 0 4px 20px; font-style: italic; }
  .viabilidad { margin-top: 20px; font-weight: bold; border: 2px solid #333; padding: 8px; text-align: center; }
  .datos { margin-top: 20px; border-top: 1px solid #999; padding-top: 10px; }
  .dato-row { display: flex; gap: 40px; margin: 6px 0; }
  .dato { flex: 1; border-bottom: 1px solid #333; padding-bottom: 2px; }
  .dato-label { font-size: 9pt; color: #666; }
  img { height: 40px; }
  .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; border-bottom: 2px solid #333; padding-bottom: 8px; }
</style>
</head>
<body>
<div class="header">
  <img src="data:image/png;base64,${LOGO_B64}" />
  <div style="text-align:right; font-size:9pt; color:#666;">
    ${ficha.fecha ? `Fecha: ${ficha.fecha}` : ""}
  </div>
</div>

<h1>FICHA EVALUACIÓN INICIATIVA</h1>
<div class="sub">Se deberá evaluar cualquier iniciativa a proyecto de acuerdo con lo siguiente:</div>

<div class="financiadores">SUBDERE &nbsp;&nbsp;&nbsp; GOBIERNO REGIONAL &nbsp;&nbsp;&nbsp; MUNICIPAL</div>
<div style="text-align:center; font-size:9pt; font-style:italic; margin-bottom:12px;">(Si la iniciativa es al Gobierno Regional responder lo siguiente)</div>

<div class="pregunta">En el terreno a presentar proyecto se han llevado a cabo <strong>iniciativas dentro de los últimos 2 años</strong></div>
<div class="respuesta">${si(ficha.iniciativas_previas)}</div>
${ficha.iniciativas_previas === true ? `<div class="nota">Si la respuesta anterior es Sí se deberá evaluar la iniciativa y cumplir con las disposiciones de plazo para la presentación y esperar el plazo determinado. Si es No se puede continuar.</div>` : ""}

<div class="subtitulo">● Legalidad del terreno:</div>

<div class="pregunta">1.- Terreno cuenta con inscripción en CBR</div>
<div class="respuesta">${si(ficha.cbr)}</div>

<div class="pregunta">2.- Terreno cuenta con Rol de avalúo vigente</div>
<div class="respuesta">${si(ficha.rol_avaluo)}</div>

<div class="pregunta">3.- Terreno es de propiedad Municipal</div>
<div class="respuesta">${si(ficha.propiedad_municipal)}</div>

${ficha.propiedad_municipal === false ? `
<div class="pregunta" style="margin-left:20px;">3.1 Si la respuesta es No, el propietario está dispuesto a efectuar comodato o usufructo?</div>
<div class="respuesta" style="margin-left:40px;">${si(ficha.comodato)}</div>
` : ""}

<div class="nota">Si cualquiera de las respuestas anteriores es No, se deberá evaluar la iniciativa y cumplir con las disposiciones anteriores para comenzar el diseño o la evaluación.</div>

<div class="subtitulo">● Cumplimiento de normas:</div>

<div class="pregunta">1.- El proyecto deberá contar con permiso de edificación</div>
<div class="respuesta">${si(ficha.permiso_edificacion)}</div>

${ficha.permiso_edificacion === true ? `
<div style="margin-left:20px;">
  <div class="pregunta">El terreno es: 
    <strong>${ficha.tipo_terreno === "urbano" ? "☑ Urbano  ☐ Rural" : ficha.tipo_terreno === "rural" ? "☐ Urbano  ☑ Rural" : "☐ Urbano  ☐ Rural"}</strong>
  </div>
  ${ficha.tipo_terreno === "rural" ? `
    <div class="pregunta">Si es Rural, cuenta con IFC</div>
    <div class="respuesta">${si(ficha.ifc)}</div>
    <div class="nota">Si no cuenta con IFC se debe tramitar antes de presentar la iniciativa.</div>
  ` : ""}
  ${ficha.tipo_terreno === "urbano" ? `
    <div class="pregunta">Si el terreno es urbano, cumple con la zonificación para el diseño</div>
    <div class="respuesta">${si(ficha.zonificacion)}</div>
  ` : ""}
</div>
` : `<div class="nota">Si la respuesta es No se pasa al punto 2.</div>`}

<div class="pregunta">2.- El proyecto se encuentra dentro de las iniciativas de financiamiento y dentro del Pladeco</div>
<div class="respuesta">${si(ficha.pladeco)}</div>

<div class="viabilidad">
  ${viable === true ? "✅ Si se llega a la última respuesta con un Sí, la iniciativa es VIABLE para estudio." : viable === false ? "❌ La iniciativa NO cumple los requisitos actuales para continuar." : "⏳ Si se llega a la última respuesta con un Sí, la iniciativa es viable para estudio."}
</div>

<div class="datos">
  <div class="dato-row">
    <div class="dato">
      <div class="dato-label">Proyecto / Iniciativa</div>
      <div>${ficha.nombre_proyecto || "_______________________________"}</div>
    </div>
    <div class="dato">
      <div class="dato-label">Responsable</div>
      <div>${ficha.responsable || "_______________________________"}</div>
    </div>
    <div class="dato">
      <div class="dato-label">Fecha</div>
      <div>${ficha.fecha || "_______________"}</div>
    </div>
  </div>
</div>

</body>
</html>`;

  const blob = new Blob([html], { type: "application/msword;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Ficha_Evaluacion_${ficha.nombre_proyecto || "Iniciativa"}.doc`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function FichaEvaluacion({ ficha: fichaExterna, onChange, nombreProyecto }) {
  const [ficha, setFicha] = useState({
    ...INITIAL_FICHA,
    nombre_proyecto: nombreProyecto || "",
    fecha: new Date().toLocaleDateString("es-CL"),
  });

  // Si viene ficha externa (desde AgregarProyecto), usarla
  const f = fichaExterna || ficha;
  const setF = onChange || ((fn) => setFicha((prev) => ({ ...prev, ...fn(prev) })));
  const set = (k, v) => setF((prev) => ({ ...prev, [k]: v }));

  const viable = calcularViabilidad(f);

  return (
    <div className="space-y-5">
      {/* Encabezado fiel al documento */}
      <div className="border border-gray-300 rounded-xl overflow-hidden">
        <div className="bg-gray-50 px-5 py-4 flex items-center justify-between border-b border-gray-200">
          <img
            src={`data:image/png;base64,${LOGO_B64}`}
            alt="SECPLAN"
            className="h-10 object-contain"
          />
          <div className="text-right">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ficha Evaluación Iniciativa</p>
            <p className="text-xs text-gray-400 mt-0.5">SECPLAN — Municipalidad de Molina</p>
          </div>
        </div>

        <div className="px-5 py-4 space-y-1 border-b border-gray-100 bg-white">
          <p className="text-xs text-gray-500 italic text-center">
            Se deberá evaluar cualquier iniciativa a proyecto de acuerdo con lo siguiente:
          </p>
          <div className="flex justify-center gap-6 mt-2">
            {["SUBDERE", "Gobierno Regional", "Municipal"].map((o) => (
              <span key={o} className="text-xs font-bold text-slate-700 px-3 py-1 bg-slate-100 rounded-full">{o}</span>
            ))}
          </div>
        </div>

        <div className="px-5 py-4 space-y-5 bg-white">
          {/* Iniciativas previas */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <p className="text-xs text-blue-700 italic mb-3">(Si la iniciativa es al Gobierno Regional responder lo siguiente)</p>
            <RadioDoc
              label="En el terreno a presentar proyecto se han llevado a cabo iniciativas dentro de los últimos 2 años"
              value={f.iniciativas_previas}
              onChange={(v) => set("iniciativas_previas", v)}
            />
            {f.iniciativas_previas === true && (
              <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
                Se deberá evaluar la iniciativa y cumplir con las disposiciones de plazo para la presentación y esperar el plazo determinado. Si es No se puede continuar.
              </div>
            )}
          </div>

          {/* Legalidad del terreno */}
          <div>
            <p className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 bg-slate-800 text-white rounded-full text-xs flex items-center justify-center">●</span>
              Legalidad del terreno
            </p>
            <div className="space-y-3 pl-7">
              <RadioDoc label="1.- Terreno cuenta con inscripción en CBR" value={f.cbr} onChange={(v) => set("cbr", v)} />
              <RadioDoc label="2.- Terreno cuenta con Rol de avalúo vigente" value={f.rol_avaluo} onChange={(v) => set("rol_avaluo", v)} />
              <RadioDoc label="3.- Terreno es de propiedad Municipal" value={f.propiedad_municipal} onChange={(v) => set("propiedad_municipal", v)} />
              {f.propiedad_municipal === false && (
                <div className="ml-4 pl-3 border-l-2 border-gray-300 space-y-2">
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
              <span className="w-5 h-5 bg-slate-800 text-white rounded-full text-xs flex items-center justify-center">●</span>
              Cumplimiento de normas
            </p>
            <div className="space-y-3 pl-7">
              <RadioDoc
                label="1.- El proyecto deberá contar con permiso de edificación"
                value={f.permiso_edificacion}
                onChange={(v) => set("permiso_edificacion", v)}
              />
              {f.permiso_edificacion === false && (
                <p className="text-xs text-gray-500 italic ml-4">Si la respuesta es No se pasa al punto 2.</p>
              )}
              {f.permiso_edificacion === true && (
                <div className="ml-4 pl-3 border-l-2 border-gray-300 space-y-3">
                  <div>
                    <p className="text-sm text-gray-700 mb-2">El terreno es:</p>
                    <div className="flex gap-3">
                      {["Urbano", "Rural"].map((t) => (
                        <button key={t} onClick={() => set("tipo_terreno", t.toLowerCase())}
                          className={`px-5 py-1.5 rounded-lg text-sm font-medium border transition-all ${f.tipo_terreno === t.toLowerCase() ? "bg-amber-400 border-amber-400 text-white" : "border-gray-200 text-gray-600 hover:border-amber-300"}`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  {f.tipo_terreno === "rural" && (
                    <>
                      <RadioDoc label="Si es Rural, ¿cuenta con IFC?" value={f.ifc} onChange={(v) => set("ifc", v)} />
                      {f.ifc === false && (
                        <p className="text-xs text-gray-500 italic">Si no cuenta con IFC se debe tramitar antes de presentar la iniciativa.</p>
                      )}
                    </>
                  )}
                  {f.tipo_terreno === "urbano" && (
                    <RadioDoc label="Si el terreno es urbano, ¿cumple con la zonificación para el diseño?" value={f.zonificacion} onChange={(v) => set("zonificacion", v)} />
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

          {/* Resultado */}
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
          {viable === null && f.pladeco === null && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 italic font-bold">Si se llega a la última respuesta con un Sí, la iniciativa es viable para estudio.</p>
            </div>
          )}

          {/* Datos del pie */}
          <div className="border-t border-gray-200 pt-4 grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Proyecto / Iniciativa</label>
              <input className="input text-sm" value={f.nombre_proyecto} onChange={(e) => set("nombre_proyecto", e.target.value)} placeholder="Nombre..." />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Responsable</label>
              <input className="input text-sm" value={f.responsable || ""} onChange={(e) => set("responsable", e.target.value)} placeholder="Nombre responsable..." />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Fecha</label>
              <input className="input text-sm" value={f.fecha || ""} onChange={(e) => set("fecha", e.target.value)} placeholder="dd/mm/aaaa" />
            </div>
          </div>
        </div>
      </div>

      {/* Botón descargar */}
      <button
        onClick={() => descargarWord(f)}
        className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-600 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50 transition-all">
        <span>⬇</span> Descargar ficha como Word (.doc)
      </button>
    </div>
  );
}

function RadioDoc({ label, value, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <p className="text-sm text-gray-800 flex-1 leading-snug">{label}</p>
      <div className="flex gap-2 flex-shrink-0 items-center">
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