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
    if (!confirm("Are you sure you want to decommission this operator?")) return;
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
        <thead className="bg-slate-950/50 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
          <tr>
            <th className="px-8 py-4">Operator</th>
            <th className="px-8 py-4">Coordinates</th>
            <th className="px-8 py-4 text-center">Protocol</th>
            <th className="px-8 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/40">
          {rows.map((u) => (
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
                  {u.channel}
                </span>
              </td>
              <td className="px-8 py-5 text-right">
                <button 
                  className="text-rose-500 hover:text-rose-400 text-[10px] font-black uppercase tracking-[0.15em] transition-colors"
                  onClick={() => remove(u.id)}
                >
                  Decommission
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
