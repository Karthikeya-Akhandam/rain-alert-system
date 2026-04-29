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
      setError("Failed to load users. You might not have permission to view this page.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-100">User Management</h1>
        <p className="text-slate-400 text-sm mt-1">Manage system operators and their notification preferences.</p>
      </header>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}
      
      <div className="bg-[#0f1423] border border-slate-800 rounded-xl overflow-hidden">
        <UserTable rows={rows} onChanged={load} />
      </div>
    </div>
  );
}
