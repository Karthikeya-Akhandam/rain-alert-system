import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import { UserTable, type UserRow } from "../components/UserTable";

export function UsersPage() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const r = await api.get<UserRow[]>("/users");
      setRows(r.data);
    } catch (e: unknown) {
      setError("Failed to load users. You might not have admin permissions.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="users-page">
      <header style={{ marginBottom: "2rem" }}>
        <h1>Admin: User Management</h1>
        <p style={{ color: "#94a3b8" }}>Manage registered users and their notification settings.</p>
      </header>
      
      {error && <p className="error card">{error}</p>}
      
      <div className="card">
        <UserTable rows={rows} onChanged={load} />
      </div>
    </div>
  );
}
