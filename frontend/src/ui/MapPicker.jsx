import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

function ClickHandler({ setPos }) {
  useMapEvents({
    click(e) {
      setPos({ lat: e.latlng.lat, lon: e.latlng.lng });
    },
  });
  return null;
}

export default function MapPicker({
  value,          // {lat, lon} or null
  onChange,       // (pos) => void
  height = 260,
  defaultCenter = { lat: 6.9271, lon: 79.8612 },
}) {
  const [pos, setPos] = useState(value || null);

  // Track the last value we notified to parent to avoid redundant onChange loops
  const lastSentRef = useRef("__init__");

  const keyOf = (p) => (p ? `${p.lat.toFixed(6)},${p.lon.toFixed(6)}` : "null");

  // ✅ Only update local pos when incoming value actually changed (by value, not by reference)
  useEffect(() => {
    const incomingKey = keyOf(value);
    const currentKey = keyOf(pos);
    if (incomingKey !== currentKey) {
      setPos(value || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.lat, value?.lon]); // depend on primitives to avoid ref churn

  // ✅ Only notify parent when local pos truly changed and it's different from last sent
  useEffect(() => {
    if (!onChange) return;
    const k = keyOf(pos);
    if (k !== lastSentRef.current) {
      lastSentRef.current = k;
      onChange(pos || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos?.lat, pos?.lon]); // depend on primitives

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const timer = useRef(null);

  const search = async (q) => {
    if (!q || q.trim().length < 3) { setResults([]); return; }
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`;
      const res = await fetch(url, {
        headers: { "User-Agent": "construction-dashboard (demo)" },
      });
      const data = await res.json();
      setResults(
        (data || []).map((d) => ({
          label: d.display_name,
          lat: Number(d.lat),
          lon: Number(d.lon),
        }))
      );
    } catch {
      setResults([]);
    }
  };

  const onQueryChange = (e) => {
    const q = e.target.value;
    setQuery(q);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => search(q), 350);
  };

  const center = useMemo(() => {
    if (pos) return [pos.lat, pos.lon];
    return [defaultCenter.lat, defaultCenter.lon];
  }, [pos, defaultCenter]);

  return (
    <div className="w-full">
      <div className="relative mb-2">
        <input
          value={query}
          onChange={onQueryChange}
          placeholder="Search address or place…"
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
        />
        {!!results.length && (
          <div className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow">
            {results.map((r, i) => (
              <button
                key={`${r.lat}-${r.lon}-${i}`}
                onClick={() => { setPos({ lat: r.lat, lon: r.lon }); setResults([]); setQuery(r.label); }}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
              >
                {r.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200">
        <MapContainer
          center={center}
          zoom={pos ? 14 : 11}
          style={{ height }}
          scrollWheelZoom
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <ClickHandler setPos={setPos} />
          {pos && <Marker position={[pos.lat, pos.lon]} icon={markerIcon} />}
        </MapContainer>
      </div>

      <div className="mt-2 text-xs text-gray-600">
        {pos ? (
          <>Selected: <span className="font-mono">{pos.lat.toFixed(5)}, {pos.lon.toFixed(5)}</span></>
        ) : (
          <>Click on the map to select coordinates.</>
        )}
      </div>
    </div>
  );
}
