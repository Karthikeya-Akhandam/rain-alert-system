import { api } from "../api/client";

export type UserRow = {
  id: number;
  name: string;
  email: string | null;
  lat: number;
  lon: number;
  channel: string;
  is_admin: boolean;
};

export function UserTable({ rows, onChanged }: { rows: UserRow[]; onChanged: () => void }) {
  const remove = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/users/${id}`);
      onChanged();
    } catch (err) {
      console.error("Failed to delete user", err);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-slate-800/30 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <tr>
            <th className="px-6 py-4">User</th>
            <th className="px-6 py-4">Location</th>
            <th className="px-6 py-4 text-center">Channel</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {rows.map((u) => (
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
                {u.lat.toFixed(4)}, {u.lon.toFixed(4)}
              </td>
              <td className="px-6 py-4 text-center">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border bg-slate-800 text-slate-400 border-slate-700`}>
                  {u.channel}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button 
                  className="text-red-500 hover:text-red-400 text-xs font-semibold transition-colors"
                  onClick={() => remove(u.id)}
                >
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
