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
    setStatusMsg("Sending test alert...");
    try {
      await api.post(`/users/${userId}/test-alert`);
      setStatusMsg("Test alert sent successfully!");
    } catch (err: any) {
      setStatusMsg(`Error: ${err.response?.data?.detail || "Failed to send"}`);
    }
    setTimeout(() => setStatusMsg(null), 5000);
  };

  if (loading) return <div className="loading">Loading your dashboard...</div>;

  return (
    <div className="dashboard-container">
      {/* Backgrounds */}
      <div className="bg-ambient">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
      </div>
      {!user?.is_admin && <RainBackground />}

      <header style={{ marginBottom: "2rem" }}>
        <h1>Welcome back, {user?.name}</h1>
        <p style={{ color: "#94a3b8" }}>
          {user?.is_admin ? "Administrator Console" : "Your Personal Weather Monitor"}
        </p>
      </header>

      {statusMsg && (
        <div className={`card ${statusMsg.startsWith("Error") ? "error" : "success"}`} style={{ borderLeft: "4px solid" }}>
          {statusMsg}
        </div>
      )}

      {user?.is_admin ? (
        <section className="admin-view">
          <div className="card">
            <h2>System Users</h2>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${u.is_admin ? "badge-admin" : "badge-user"}`}>
                        {u.is_admin ? "Admin" : "User"}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="primary" 
                        style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem" }}
                        onClick={() => handleTestAlert(u.id)}
                      >
                        Send Test Mail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="user-view">
          <div className="card highlight" style={{ textAlign: "center", padding: "3rem" }}>
            <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
              {weather?.next_hour_pop !== null 
                ? `${Math.round(weather.next_hour_pop * 100)}% chance of rain`
                : "Checking your forecast..."}
            </h2>
            <p style={{ fontSize: "1.1rem", color: "#94a3b8" }}>
              Location: <strong>{user?.lat.toFixed(2)}, {user?.lon.toFixed(2)}</strong>
            </p>
            <div style={{ marginTop: "2rem", display: "flex", justifyContent: "center", gap: "2rem" }}>
              <div>
                <p style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#64748b" }}>Channel</p>
                <p style={{ fontWeight: "bold" }}>{user?.channel.toUpperCase()}</p>
              </div>
              <div>
                <p style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#64748b" }}>Threshold</p>
                <p style={{ fontWeight: "bold" }}>{user ? Math.round(user.rain_pop_threshold * 100) : 0}%</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
