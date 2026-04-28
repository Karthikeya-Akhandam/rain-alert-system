import { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon in Leaflet + Webpack/Vite
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
  lat: number;
  lon: number;
  onChange: (lat: number, lon: number) => void;
}

function LocationMarker({ lat, lon, onChange }: MapPickerProps) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return lat !== 0 || lon !== 0 ? <Marker position={[lat, lon]} /> : null;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom() === 2 ? 13 : map.getZoom());
  }, [center, map]);
  return null;
}

export function MapPicker({ lat, lon, onChange }: MapPickerProps) {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search) return;
    setLoading(true);
    try {
      const resp = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(search)}&count=1&language=en&format=json`
      );
      const data = await resp.json();
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        onChange(result.latitude, result.longitude);
      }
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="map-picker space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && void handleSearch(e as any)}
          placeholder="Search sector (e.g. Tokyo)..."
          className="bg-slate-950/50 border-slate-800 text-xs font-mono py-2 rounded-lg"
        />
        <button 
          type="button" 
          onClick={handleSearch} 
          disabled={loading}
          className="bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-black uppercase tracking-widest px-4 rounded-lg transition-all whitespace-nowrap"
        >
          {loading ? "Scanning..." : "Locate"}
        </button>
      </div>
      <div className="h-[300px] rounded-xl overflow-hidden border border-slate-800 shadow-inner">
        <MapContainer
          center={[lat || 0, lon || 0]}
          zoom={lat === 0 && lon === 0 ? 2 : 13}
          style={{ height: "100%", width: "100%", background: "#020617" }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <LocationMarker lat={lat} lon={lon} onChange={onChange} />
          <ChangeView center={[lat || 0, lon || 0]} />
        </MapContainer>
      </div>
      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest italic ml-1">
        ❯ Click map to confirm precise orbital coordinates
      </p>
    </div>
  );
}
