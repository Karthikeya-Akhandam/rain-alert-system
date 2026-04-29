import { useEffect, useState } from "react";
import Map, { Marker } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

interface MapPickerProps {
  lat: number;
  lon: number;
  onChange: (lat: number, lon: number) => void;
}

export function MapPicker({ lat, lon, onChange }: MapPickerProps) {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [viewState, setViewState] = useState({
    latitude: lat || 0,
    longitude: lon || 0,
    zoom: lat === 0 && lon === 0 ? 2 : 12,
  });

  // Sync viewState when lat/lon props change from outside (e.g. search or parent update)
  useEffect(() => {
    setViewState(prev => ({
      ...prev,
      latitude: lat,
      longitude: lon,
      zoom: lat === 0 && lon === 0 ? prev.zoom : (prev.zoom < 10 ? 12 : prev.zoom),
    }));
  }, [lat, lon]);

  const handleSearch = async (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (!search) return;
    
    setLoading(true);
    setError(null);
    try {
      // Using Nominatim (OSM) for better search results (acronyms, local places)
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(search)}&format=json&limit=1`,
        {
          headers: {
            'Accept-Language': 'en',
            // Identifying the user agent as per Nominatim's usage policy
            'User-Agent': 'RainAlertSystem/1.0'
          }
        }
      );
      const data = await resp.json();
      if (data && data.length > 0) {
        const result = data[0];
        onChange(parseFloat(result.lat), parseFloat(result.lon));
      } else {
        setError("No results found. Try a more specific name.");
      }
    } catch (err) {
      console.error("Search failed", err);
      setError("Search service unavailable. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const onMapClick = (e: any) => {
    const { lng, lat } = e.lngLat;
    onChange(lat, lng);
  };

  return (
    <div className="map-picker space-y-4">
      <div className="space-y-1">
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void handleSearch(e)}
            placeholder="Search location (e.g. London, SRMIST)..."
            className="flex-1 bg-slate-900 border-slate-700 text-slate-200 text-sm py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/50"
          />
          <button 
            type="button" 
            onClick={() => void handleSearch()} 
            disabled={loading}
            className="bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 text-white text-xs font-semibold px-4 rounded-lg transition-colors whitespace-nowrap"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
        {error && <p className="text-[10px] text-red-400 font-medium ml-1">{error}</p>}
      </div>
      
      <div className="h-[350px] rounded-xl overflow-hidden border border-slate-800 shadow-xl relative group">
        <Map
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          onClick={onMapClick}
          mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
          style={{ width: '100%', height: '100%' }}
        >
          {lat !== 0 && lon !== 0 && (
            <Marker longitude={lon} latitude={lat} color="#38bdf8" />
          )}
        </Map>
        
        <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 pointer-events-none transition-opacity group-hover:opacity-100 opacity-60">
          <p className="text-[10px] font-medium text-slate-300">
            Click map to set coordinates
          </p>
        </div>
      </div>
    </div>
  );
}
