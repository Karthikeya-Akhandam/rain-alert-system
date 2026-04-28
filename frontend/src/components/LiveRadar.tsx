import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface LiveRadarProps {
  lat: number;
  lon: number;
}

export function LiveRadar({ lat, lon }: LiveRadarProps) {
  const [radarTime, setRadarTime] = useState<number | null>(null);

  useEffect(() => {
    // Fetch latest radar data from RainViewer
    void (async () => {
      try {
        const resp = await fetch("https://api.rainviewer.com/public/weather-maps.json");
        const data = await resp.json();
        if (data.radar && data.radar.past && data.radar.past.length > 0) {
          // Get the most recent timestamp
          const latest = data.radar.past[data.radar.past.length - 1];
          setRadarTime(latest.time);
        }
      } catch (err) {
        console.error("Failed to fetch radar timestamps", err);
      }
    })();
  }, []);

  const position: [number, number] = [lat, lon];

  return (
    <div className="w-full h-full relative group">
      <MapContainer
        center={position}
        zoom={8}
        scrollWheelZoom={false}
        dragging={false}
        zoomControl={false}
        attributionControl={false}
        style={{ height: "100%", width: "100%", background: "#020617" }}
      >
        {/* Dark Mode Map Base */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* RainViewer Radar Layer */}
        {radarTime && (
          <TileLayer
            url={`https://tilecache.rainviewer.com/v2/radar/${radarTime}/256/{z}/{x}/{y}/2/1_1.png`}
            opacity={0.6}
          />
        )}

        <Marker position={position} />
      </MapContainer>
      
      {/* Overlay to maintain the "Operator" aesthetic */}
      <div className="absolute inset-0 pointer-events-none border border-sky-500/20 z-[1000]">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #0ea5e9 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="material-icons text-sky-500 text-sm animate-pulse">radar</span>
            <span className="text-[10px] font-black text-sky-400 uppercase tracking-[0.3em]">Live Feed: Active</span>
        </div>
      </div>
    </div>
  );
}
