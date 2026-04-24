import { api } from "../api/client";

export type UserRow = {
  id: number;
  name: string;
  email: string | null;
  lat: number;
  lon: number;
  channel: string;
};

export function UserTable({ rows, onChanged }: { rows: UserRow[]; onChanged: () => void }) {
  const remove = async (id: number) => {
    await api.delete(`/users/${id}`);
    onChanged();
  };

  return (
    <div className="card">
      <h2>Users</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Lat</th>
            <th>Lon</th>
            <th>Channel</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.name}</td>
              <td>{u.email ?? ""}</td>
              <td>{u.lat}</td>
              <td>{u.lon}</td>
              <td>{u.channel}</td>
              <td>
                <button type="button" onClick={() => remove(u.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
