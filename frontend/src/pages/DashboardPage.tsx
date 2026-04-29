import { useEffect, useState } from "react";
import { api } from "../api/client";

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
  const [statusMsg, setStatusMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

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
    setStatusMsg({ text: "Sending alert...", type: 'success' });
    try {
      await api.post(`/users/${userId}/test-alert`);
      setStatusMsg({ text: "Alert sent successfully.", type: 'success' });
    } catch (err: any) {
      setStatusMsg({ 
        text: `Error: ${err.response?.data?.detail || "Failed to send alert"}`, 
        type: 'error' 
      });
    }
    setTimeout(() => setStatusMsg(null), 5000);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            {user?.is_admin ? "User Management" : "Weather Forecast"}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {user?.is_admin ? "Monitor and manage all system users." : `Forecast for your location (${user?.lat.toFixed(2)}, ${user?.lon.toFixed(2)})`}
          </p>
        </div>
        
        {statusMsg && (
          <div className={`px-4 py-2 rounded-md text-sm font-medium border ${
            statusMsg.type === 'error' 
              ? 'bg-red-500/10 border-red-500/20 text-red-400' 
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          }`}>
            {statusMsg.text}
          </div>
        )}
      </div>

      {user?.is_admin ? (
        <div className="bg-[#0f1423] border border-slate-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-800/30 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Channel</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {allUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                          {u.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-200">{u.name}</div>
                          <div className="text-xs text-slate-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 font-mono">
                      {u.lat.toFixed(3)}, {u.lon.toFixed(3)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-400 border border-slate-700">
                        {u.channel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleTestAlert(u.id)}
                        className="text-xs font-semibold text-sky-500 hover:text-sky-400 transition-colors"
                      >
                        Send Test Alert
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-[#0f1423] border border-slate-800 rounded-xl p-8 flex flex-col justify-center items-center text-center space-y-6">
            <div className="space-y-2">
              <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Precipitation Probability</h3>
              <div className="text-7xl font-bold text-slate-100">
                {weather?.next_hour_pop != null ? Math.round(weather.next_hour_pop * 100) : '--'}%
              </div>
            </div>
            
            <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border ${
              weather?.next_hour_pop != null && weather.next_hour_pop > (user?.rain_pop_threshold || 0.5)
                ? 'bg-red-500/10 border-red-500/20 text-red-400'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}>
              {weather?.next_hour_pop != null && weather.next_hour_pop > (user?.rain_pop_threshold || 0.5)
                ? 'Rain Likely - Alerts Active'
                : 'Clear Skies - No Rain Expected'}
            </div>
          </div>

          <div className="bg-[#0f1423] border border-slate-800 rounded-xl p-6 space-y-6">
            <h3 className="text-slate-200 text-sm font-semibold">Your Alert Settings</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Channel</span>
                <span className="font-medium text-slate-200 uppercase">{user?.channel}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Threshold</span>
                <span className="font-medium text-slate-200">{user ? Math.round(user.rain_pop_threshold * 100) : 0}% POP</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Status</span>
                <span className="text-emerald-500 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                </span>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-800">
              <button 
                onClick={() => user && handleTestAlert(user.id)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-md transition-colors"
              >
                Send Test Notification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
