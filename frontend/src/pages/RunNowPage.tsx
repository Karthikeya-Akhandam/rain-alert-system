import { useState } from "react";
import { api } from "../api/client";

export function RunNowPage() {
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const r = await api.post("/runs/execute");
      setMsg(`MISSION_COMPLETE: [RUN_ID: ${r.data.run_id}] | PROCESSED: ${r.data.users_processed} | ALERTS: ${r.data.alerts_sent}`);
    } catch (err) {
      setMsg("MISSION_FAILURE: Terminal uplink interrupted.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <header>
        <h2 className="text-3xl font-black tracking-tighter glow-text uppercase italic">Mission Execution</h2>
        <p className="text-slate-500 text-sm font-medium tracking-wide uppercase">Manual Override for Global Alert Distribution</p>
      </header>

      <div className="glass p-10 flex flex-col items-center text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4">
          <span className="material-icons text-rose-500 text-3xl animate-pulse">warning</span>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-bold uppercase tracking-tight">Execute Global Batch Job</h3>
          <p className="text-slate-400 text-sm max-w-md">
            This will force a synchronization with atmospheric data for all active operators and distribute alerts via configured SMTP/SMS gateways.
          </p>
        </div>

        <button 
          className="bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-[0.2em] px-10 py-4 rounded-xl transition-all shadow-xl shadow-rose-900/30 disabled:opacity-50 disabled:cursor-not-allowed" 
          type="button" 
          onClick={() => void run()}
          disabled={loading}
        >
          {loading ? "Distributing Alerts..." : "Initialize Launch Sequence"}
        </button>

        {msg && (
          <div className={`mt-8 p-4 rounded-lg font-mono text-[10px] font-bold border transition-all animate-in zoom-in-95 ${msg.includes('FAILURE') ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-sky-500/10 border-sky-500/20 text-sky-400'}`}>
            <span className="mr-2">❯</span> {msg}
          </div>
        )}
      </div>

      <div className="glass p-6 bg-slate-900/40">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Standard Operating Procedures</h4>
        <ul className="space-y-3">
          <li className="flex items-start gap-3 text-xs text-slate-400 font-medium italic">
            <span className="text-sky-500">•</span> Only use manual override if scheduled tasks fail to initialize.
          </li>
          <li className="flex items-start gap-3 text-xs text-slate-400 font-medium italic">
            <span className="text-sky-500">•</span> Ensure gateway credentials (SMTP/TWILIO) are validated before launch.
          </li>
        </ul>
      </div>
    </div>
  );
}
