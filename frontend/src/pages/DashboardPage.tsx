import { useEffect, useState } from "react";
import { api } from "../api/client";
import { RainBackground } from "../components/RainBackground";

type UserInfo = {
  id: number;
  name: string;
  email: string;
  lat: number;
  lon: number;
  channel: string;
  rain_pop_threshold: number;
  is_admin: boolean;
};

type WeatherInfo = {
  next_hour_pop: number | null;
  next_hour_rain_mm_per_h: number | null;
};

export function DashboardPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [allUsers, setAllUsers] = useState<UserInfo[]>([]);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const userRes = await api.get<UserInfo>("/users/me");
        setUser(userRes.data);

        if (userRes.data.is_admin) {
          const usersRes = await api.get<UserInfo[]>("/users");
          setAllUsers(usersRes.data);
        } else {
          const weatherRes = await api.get<WeatherInfo>("/weather/me");
          setWeather(weatherRes.data);
        }
      } catch (err) {
        console.error("Dashboard data load failed", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleTestAlert = async (userId: number) => {
    setStatusMsg("Initiating alert sequence...");
    try {
      await api.post(`/users/${userId}/test-alert`);
      setStatusMsg("Alert sequence confirmed. Uplink successful.");
    } catch (err: any) {
      setStatusMsg(`Mission Failure: ${err.response?.data?.detail || "Connection lost"}`);
    }
    setTimeout(() => setStatusMsg(null), 5000);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-sky-500 font-mono text-sm animate-pulse tracking-widest">SYNCHRONIZING WITH GOES-R SATELLITE...</div>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 relative">
      {!user?.is_admin && <RainBackground />}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter glow-text uppercase italic">
            {user?.is_admin ? "Mission Control" : "Atmospheric Feed"}
          </h2>
          <p className="text-slate-500 text-sm font-medium tracking-wide uppercase">
            {user?.is_admin ? "Precision Grid Monitor v4.0" : `Sector Assignment: ${user?.lat.toFixed(2)}N / ${user?.lon.toFixed(2)}E`}
          </p>
        </div>
        {statusMsg && (
          <div className={`px-4 py-2 rounded-lg border text-xs font-bold uppercase tracking-widest animate-in fade-in slide-in-from-top-2 ${statusMsg.includes('Failure') ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
            {statusMsg}
          </div>
        )}
      </div>

      {user?.is_admin ? (
        /* Admin View - Operator Grid */
        <div className="glass overflow-hidden">
          <div className="p-6 border-b border-slate-800/60 bg-slate-900/30 flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-300">Active Grid Monitor</h3>
            <span className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span> Live telemetry
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-950/50 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <tr>
                  <th className="px-8 py-4">Operator</th>
                  <th className="px-8 py-4">Coordinates</th>
                  <th className="px-8 py-4 text-center">Status</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {allUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-sky-500/[0.03] transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-400 group-hover:border-sky-500/50 transition-colors">
                          {u.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold">{u.name}</div>
                          <div className="text-[10px] font-mono text-slate-500 uppercase">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-xs font-mono text-slate-400">
                        {u.lat.toFixed(4)}° N, {u.lon.toFixed(4)}° E
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${u.is_admin ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-sky-500/10 text-sky-500 border-sky-500/20'}`}>
                        {u.is_admin ? 'Admin' : 'Monitoring'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        className="bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-black uppercase tracking-[0.15em] px-4 py-2 rounded-lg transition-all shadow-lg shadow-sky-900/20"
                        onClick={() => handleTestAlert(u.id)}
                      >
                        Fire Alert
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* User View - Atmospheric Feed */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Display */}
          <div className="lg:col-span-2 glass p-8 relative overflow-hidden flex flex-col justify-between min-h-[400px]">
            <div className="absolute top-0 right-0 p-8">
              <div className="text-[10px] font-black text-sky-500/40 uppercase tracking-[0.3em]">Telemetry Stream</div>
            </div>
            
            <div>
              <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.25em] mb-4">Current Probability</h3>
              <div className="flex items-baseline gap-4">
                <span className="text-8xl font-black tracking-tighter glow-text italic">
                  {weather?.next_hour_pop != null ? Math.round(weather.next_hour_pop * 100) : '--'}
                  <span className="text-4xl not-italic ml-2 text-sky-500/50">%</span>
                </span>
              </div>
              <div className="mt-6 text-2xl font-bold uppercase tracking-tight">
                Status: <span className="text-sky-400">
                  {weather?.next_hour_pop != null && weather.next_hour_pop > 0.5 ? 'Critical Precipitation Detected' : 'Clear Skies Maintained'}
                </span>
              </div>
            </div>

            <div className="mt-12 aspect-video w-full glass bg-slate-950/80 border-slate-700/50 flex flex-col items-center justify-center relative group overflow-hidden">
               <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #0ea5e9 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
               <span className="material-icons text-sky-500 text-5xl animate-pulse">radar</span>
               <div className="mt-4 text-[10px] font-mono text-sky-400 uppercase tracking-[0.4em] font-black">Live Radar Sector Active</div>
               <div className="absolute bottom-4 flex gap-12 text-[9px] font-mono text-slate-500 font-bold uppercase">
                 <span className="flex items-center gap-2"><span className="w-1 h-1 bg-sky-500 rounded-full"></span> LAT: {user?.lat.toFixed(4)}</span>
                 <span className="flex items-center gap-2"><span className="w-1 h-1 bg-indigo-500 rounded-full"></span> LON: {user?.lon.toFixed(4)}</span>
               </div>
            </div>
          </div>

          {/* Terminal / Stats */}
          <div className="flex flex-col gap-8">
            <div className="glass flex-1 flex flex-col bg-slate-950/60">
              <div className="p-4 border-b border-slate-800/60 flex justify-between items-center bg-slate-900/40">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Terminal Event Stream</h3>
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              </div>
              <div className="p-6 font-mono text-[11px] space-y-3 flex-1 text-slate-400 overflow-y-auto">
                <p><span className="text-slate-600">[02:44:01]</span> Uplink synchronized...</p>
                <p><span className="text-slate-600">[02:43:55]</span> Analyzing cloud density...</p>
                <p><span className="text-sky-800 italic">... Monitoring atmospheric shifts</span></p>
                {weather?.next_hour_pop && weather.next_hour_pop > 0 ? (
                   <p className="text-sky-500 font-bold"><span className="text-slate-600">[02:43:12]</span> Alert: {Math.round(weather.next_hour_pop * 100)}% moisture threshold reached</p>
                ) : null}
              </div>
            </div>

            <div className="glass p-6 bg-indigo-500/[0.03] border-indigo-500/20">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-6">Profile Configuration</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-800/40 pb-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Uplink Target</span>
                  <span className="text-xs font-black">{user?.channel.toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800/40 pb-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Risk Tolerance</span>
                  <span className="text-xs font-black">{user ? Math.round(user.rain_pop_threshold * 100) : 0}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
