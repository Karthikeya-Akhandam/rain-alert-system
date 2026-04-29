import { useState } from "react";
import { api } from "../api/client";

export function RunNowPage() {
  const [msg, setMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const r = await api.post("/runs/execute");
      setMsg({
        text: `Batch job completed. Processed: ${r.data.users_processed}, Alerts sent: ${r.data.alerts_sent}`,
        type: 'success'
      });
    } catch (err) {
      setMsg({
        text: "Error: Failed to execute manual batch job.",
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-100">Manual Batch Job</h1>
        <p className="text-slate-400 text-sm mt-1">Manually trigger the rain alert process for all users.</p>
      </header>

      <div className="bg-[#0f1423] border border-slate-800 rounded-2xl p-10 flex flex-col items-center text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-2">
          <span className="material-icons text-amber-500 text-3xl">play_circle_outline</span>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-100">Execute Global Job</h2>
          <p className="text-slate-400 text-sm max-w-md">
            This will check weather data for every registered user and send notifications if the rain probability exceeds their thresholds.
          </p>
        </div>

        <button 
          className="bg-sky-600 hover:bg-sky-500 text-white font-semibold px-8 py-3 rounded-lg transition-colors disabled:bg-slate-800 disabled:text-slate-500" 
          type="button" 
          onClick={() => void run()}
          disabled={loading}
        >
          {loading ? "Executing Job..." : "Run Job Now"}
        </button>

        {msg && (
          <div className={`mt-6 p-4 rounded-lg text-sm font-medium border w-full max-w-lg ${
            msg.type === 'error' 
              ? 'bg-red-500/10 border-red-500/20 text-red-400' 
              : 'bg-sky-500/10 border-sky-500/20 text-sky-400'
          }`}>
            {msg.text}
          </div>
        )}
      </div>

      <div className="bg-[#0f1423] border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-slate-200 mb-4 uppercase tracking-wider">System Notes</h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3 text-sm text-slate-400">
            <span className="text-sky-500 font-bold">•</span> This action affects all users and may take a moment to complete.
          </li>
          <li className="flex items-start gap-3 text-sm text-slate-400">
            <span className="text-sky-500 font-bold">•</span> Notifications are sent using configured SMTP and SMS providers.
          </li>
        </ul>
      </div>
    </div>
  );
}
