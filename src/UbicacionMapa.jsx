import { useState, useEffect, useRef, useCallback } from "react";

// API Key de Google Maps — el usuario debe poner aquí su key
// Instrucciones: https://developers.google.com/maps/documentation/javascript/get-api-key
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || "";

// Centro por defecto: Molina, Maule, Chile
const DEFAULT_CENTER = { lat: -35.1167, lng: -71.2833 };
const DEFAULT_ZOOM = 14;

let mapsLoaded = false;
let mapsLoadCallbacks = [];

function loadGoogleMaps(apiKey) {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) { resolve(); return; }
    if (mapsLoaded) { mapsLoadCallbacks.push(resolve); return; }
    mapsLoaded = true;
    window.__mapsReady = () => {
      resolve();
      mapsLoadCallbacks.forEach((cb) => cb());
      mapsLoadCallbacks = [];
    };
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=__mapsReady&language=es`;
    script.async = true;
    script.onerror = () => reject(new Error("No se pudo cargar Google Maps"));
    document.head.appendChild(script);
  });
}

export default function UbicacionMapa({ value, onChange }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [address, setAddress] = useState(value || "");
  const [coords, setCoords] = useState(null);
  const [modoMapa, setModoMapa] = useState(false);

  const noApiKey = !GOOGLE_MAPS_API_KEY;

  // Inicializar mapa
  const initMap = useCallback(async () => {
    if (!GOOGLE_MAPS_API_KEY) return;
    try {
      await loadGoogleMaps(GOOGLE_MAPS_API_KEY);
      setReady(true);
    } catch {
      setError("No se pudo cargar Google Maps. Verifica tu conexión.");
    }
  }, []);

  useEffect(() => {
    if (modoMapa) initMap();
  }, [modoMapa, initMap]);

  // Crear mapa cuando está listo
  useEffect(() => {
    if (!ready || !modoMapa || !mapRef.current) return;
    if (mapInstance.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: coords || DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });
    mapInstance.current = map;

    // Marker arrastrable
    const marker = new window.google.maps.Marker({
      map,
      position: coords || DEFAULT_CENTER,
      draggable: true,
      title: "Arrastra para ajustar la ubicación",
      animation: window.google.maps.Animation.DROP,
    });
    markerRef.current = marker;

    // Al arrastrar el marker → geocodificar
    marker.addListener("dragend", () => {
      const pos = marker.getPosition();
      geocodeLatLng(pos.lat(), pos.lng());
    });

    // Al hacer clic en el mapa → mover marker
    map.addListener("click", (e) => {
      marker.setPosition(e.latLng);
      geocodeLatLng(e.latLng.lat(), e.latLng.lng());
    });

    // Autocomplete en el input
    if (inputRef.current) {
      const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: "cl" },
        fields: ["formatted_address", "geometry"],
      });
      autocompleteRef.current = ac;

      ac.addListener("place_changed", () => {
        const place = ac.getPlace();
        if (!place.geometry) return;
        const loc = place.geometry.location;
        const newCoords = { lat: loc.lat(), lng: loc.lng() };
        setCoords(newCoords);
        setAddress(place.formatted_address);
        onChange?.(place.formatted_address, newCoords);
        map.panTo(newCoords);
        map.setZoom(17);
        marker.setPosition(newCoords);
        marker.setAnimation(window.google.maps.Animation.DROP);
      });
    }

    // Si ya tenemos coords, centrar ahí
    if (coords) {
      map.panTo(coords);
      map.setZoom(17);
      marker.setPosition(coords);
    }
  }, [ready, modoMapa]);

  function geocodeLatLng(lat, lng) {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        const addr = results[0].formatted_address;
        setAddress(addr);
        setCoords({ lat, lng });
        onChange?.(addr, { lat, lng });
        if (inputRef.current) inputRef.current.value = addr;
      }
    });
  }

  // Sin API Key → mostrar input manual con link a Maps
  if (noApiKey) {
    return (
      <div className="space-y-2">
        <div className="relative">
          <input
            className="input pr-10"
            placeholder="Ej: Av. O'Higgins 450, Molina, Maule"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              onChange?.(e.target.value, null);
            }}
          />
          {address && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700"
              title="Ver en Google Maps">
              📍
            </a>
          )}
        </div>
        {address && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:underline inline-block">
            Ver en Google Maps →
          </a>
        )}
        <p className="text-xs text-gray-400">
          💡 Para activar el selector interactivo en el mapa, agrega{" "}
          <code className="bg-gray-100 px-1 rounded">VITE_GOOGLE_MAPS_KEY</code> en las variables de entorno de Vercel.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {!modoMapa ? (
        // Vista compacta con botón para abrir mapa
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                className="input pr-10"
                placeholder="Ej: Av. O'Higgins 450, Molina, Maule"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  onChange?.(e.target.value, null);
                }}
              />
              {address && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700"
                  title="Ver en Google Maps">
                  📍
                </a>
              )}
            </div>
            <button
              type="button"
              onClick={() => setModoMapa(true)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-all whitespace-nowrap">
              🗺 Marcar en mapa
            </button>
          </div>
          {address && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline inline-block">
              Ver en Google Maps →
            </a>
          )}
        </div>
      ) : (
        // Vista mapa expandida
        <div className="space-y-2">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700">{error}</div>
          )}
          {!error && (
            <>
              <div className="relative">
                <input
                  ref={inputRef}
                  className="input pr-10"
                  placeholder="Buscar dirección en Molina..."
                  defaultValue={address}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              </div>
              {!ready && (
                <div className="h-64 bg-gray-100 rounded-xl flex items-center justify-center">
                  <p className="text-sm text-gray-500">Cargando mapa...</p>
                </div>
              )}
              <div
                ref={mapRef}
                className={`rounded-xl overflow-hidden transition-all ${ready ? "h-64" : "h-0"}`}
                style={{ border: "1.5px solid #e5e7eb" }}
              />
              {ready && (
                <p className="text-xs text-gray-500 text-center">
                  Haz clic en el mapa o arrastra el marcador para ajustar la ubicación exacta
                </p>
              )}
            </>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setModoMapa(false)}
              className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-all">
              ← Cerrar mapa
            </button>
            {address && (
              <button
                type="button"
                onClick={() => setModoMapa(false)}
                className="flex-1 py-2 bg-amber-400 hover:bg-amber-500 text-white rounded-xl text-sm font-medium transition-all">
                ✓ Confirmar ubicación
              </button>
            )}
          </div>
          {address && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 text-xs text-green-800">
              <span className="font-medium">📍 </span>{address}
            </div>
          )}
        </div>
      )}
    </div>
  );
}