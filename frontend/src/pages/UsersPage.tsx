import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import { UserForm } from "../components/UserForm";
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
    <div>
      {error && <p className="error">{error}</p>}
      <UserForm onCreated={load} />
      <UserTable rows={rows} onChanged={load} />
    </div>
  );
}
