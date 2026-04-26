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
};

export function DashboardPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [testStatus, setTestStatus] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await api.get<UserInfo>("/users/me");
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleTestAlert = async () => {
    setTestStatus("Sending...");
    try {
      await api.post("/users/me/test-alert");
      setTestStatus("Test alert sent successfully!");
      setTimeout(() => setTestStatus(null), 5000);
    } catch (err: any) {
      setTestStatus(`Error: ${err.response?.data?.detail || "Failed to send"}`);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="dashboard">
      <div className="card">
        <h2>Welcome, {user?.name}!</h2>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Location:</strong> {user?.lat.toFixed(4)}, {user?.lon.toFixed(4)}</p>
        <p><strong>Alert Threshold:</strong> {user ? Math.round(user.rain_pop_threshold * 100) : 0}%</p>
        <p><strong>Notification Channel:</strong> {user?.channel}</p>
      </div>

      <div className="card highlight">
        <h2>Demo Mode</h2>
        <p>Want to see how notifications look? Trigger a test alert to your {user?.channel} right now.</p>
        <button 
          className="primary large" 
          onClick={handleTestAlert}
          disabled={!!testStatus && testStatus === "Sending..."}
        >
          {testStatus === "Sending..." ? "Sending..." : "🚀 Send Test Alert"}
        </button>
        {testStatus && (
          <p className={testStatus.startsWith("Error") ? "error" : "success"}>
            {testStatus}
          </p>
        )}
      </div>
    </div>
  );
}
