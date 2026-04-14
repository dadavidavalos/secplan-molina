// UbicacionMapa.jsx — versión sin API de Google Maps
// Ingreso manual de dirección con link directo a Google Maps para verificar

export default function UbicacionMapa({ value, onChange }) {
  const mapsUrl = value
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`
    : null;

  return (
    <div className="space-y-2">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">📍</span>
        <input
          className="input pl-8 pr-24"
          placeholder="Ej: Av. O'Higgins 450, Molina, Maule"
          value={value || ""}
          onChange={(e) => onChange?.(e.target.value, null)}
        />
        {mapsUrl && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-blue-500 hover:bg-blue-600 text-white px-2.5 py-1 rounded-lg transition-all whitespace-nowrap"
          >
            Ver mapa
          </a>
        )}
      </div>
      {mapsUrl && (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-500 hover:underline inline-flex items-center gap-1"
        >
          <span>🗺</span> Verificar ubicación en Google Maps →
        </a>
      )}
    </div>
  );
}