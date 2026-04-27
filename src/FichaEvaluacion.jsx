import { useState } from "react";
import JSZip from "jszip";

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
  const ANCHOR_IDS = [
    "07C23519", // 0  SUBDERE
    "095DC390", // 1  GORE
    "7EDF22B0", // 2  MUNICIPAL
    "718C651D", // 3  iniciativas Si
    "204470E2", // 4  iniciativas No
    "7D01A8D1", // 5  CBR Si
    "61AC06E3", // 6  CBR No
    "532CC109", // 7  rol_avaluo Si
    "3C4E7570", // 8  rol_avaluo No
    "65F32F83", // 9  prop_municipal Si
    "10B41E7B", // 10 prop_municipal No
    "4936E962", // 11 comodato Si
    "32BDDCE7", // 12 comodato No
    "54E17E92", // 13 permiso Si
    "196452AE", // 14 permiso No
    "2BD667E6", // 15 Urbano
    "6940C281", // 16 Rural
    "304FB53C", // 17 IFC Si
    "36D3AE5A", // 18 IFC No
    "43EF3DCC", // 19 zonificacion Si
    "6E55469A", // 20 zonificacion No
    "7BE45A03", // 21 pladeco Si
    "53543432", // 22 pladeco No
  ]

  const toFill = new Set()
  if (ficha.tipo_organismo === "SUBDERE")  toFill.add(0)
  if (ficha.tipo_organismo === "GORE")     toFill.add(1)
  if (ficha.tipo_organismo === "Municipal") toFill.add(2)
  if (ficha.iniciativas_previas === true)  toFill.add(3)
  if (ficha.iniciativas_previas === false) toFill.add(4)
  if (ficha.cbr === true)                  toFill.add(5)
  if (ficha.cbr === false)                 toFill.add(6)
  if (ficha.rol_avaluo === true)           toFill.add(7)
  if (ficha.rol_avaluo === false)          toFill.add(8)
  if (ficha.propiedad_municipal === true)  toFill.add(9)
  if (ficha.propiedad_municipal === false) toFill.add(10)
  if (ficha.comodato === true)             toFill.add(11)
  if (ficha.comodato === false)            toFill.add(12)
  if (ficha.permiso_edificacion === true)  toFill.add(13)
  if (ficha.permiso_edificacion === false) toFill.add(14)
  if (ficha.tipo_terreno === "urbano")     toFill.add(15)
  if (ficha.tipo_terreno === "rural")      toFill.add(16)
  if (ficha.ifc === true)                  toFill.add(17)
  if (ficha.ifc === false)                 toFill.add(18)
  if (ficha.zonificacion === true)         toFill.add(19)
  if (ficha.zonificacion === false)        toFill.add(20)
  if (ficha.pladeco === true)              toFill.add(21)
  if (ficha.pladeco === false)             toFill.add(22)

  fetch("/ficha_template.docx")
    .then(res => res.arrayBuffer())
    .then(buffer => JSZip.loadAsync(buffer))
    .then(zip => zip.file("word/document.xml").async("string").then(xml => {
      let modified = xml

      // Marcar cada rectángulo seleccionado rellenándolo de negro
      for (const idx of toFill) {
        const aid = ANCHOR_IDS[idx]
        // Buscar el v:rect con este anchorId y agregar filled + fillcolor
        modified = modified.replace(
          new RegExp('(<v:rect\\b[^>]*w14:anchorId="' + aid + '"[^>]*)(/>|>)', 'g'),
          '$1 filled="t" fillcolor="#000000"$2'
        )
      }

      zip.file("word/document.xml", modified)
      return zip.generateAsync({
        type: "blob",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      })
    }))
    .then(blob => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "Ficha_Evaluacion_" + (ficha.nombre_proyecto || "Iniciativa").replace(/\s+/g, "_") + ".docx"
      a.click()
      URL.revokeObjectURL(url)
    })
    .catch(err => {
      console.error("Error generando ficha:", err)
      alert("Error al generar el documento. Revisa la consola.")
    })
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
            src="/logo-molina.png"
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