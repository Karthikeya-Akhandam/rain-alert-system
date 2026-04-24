import { useCallback, useEffect, useState } from "react";
import { api, getAdminKey, setAdminKey } from "../api/client";
import { UserForm } from "../components/UserForm";
import { UserTable, type UserRow } from "../components/UserTable";

export function UsersPage() {
  const [keyInput, setKeyInput] = useState(getAdminKey());
  const [rows, setRows] = useState<UserRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const r = await api.get<UserRow[]>("/users");
      setRows(r.data);
    } catch (e: unknown) {
      setError("Failed to load users. Set admin key if required.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <div className="card">
        <h2>Admin key</h2>
        <p className="row">
          <input
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="X-Admin-Key"
          />
          <button className="primary" type="button" onClick={() => setAdminKey(keyInput)}>
            Save key
          </button>
        </p>
      </div>
      {error && <p className="error">{error}</p>}
      <UserForm onCreated={load} />
      <UserTable rows={rows} onChanged={load} />
    </div>
  );
}
