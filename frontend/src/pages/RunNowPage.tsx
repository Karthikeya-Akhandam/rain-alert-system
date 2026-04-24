import { useState } from "react";
import { api } from "../api/client";

export function RunNowPage() {
  const [msg, setMsg] = useState<string | null>(null);

  const run = async () => {
    setMsg(null);
    const r = await api.post("/runs/execute");
    setMsg(`Run ${r.data.run_id}: processed=${r.data.users_processed} sent=${r.data.alerts_sent}`);
  };

  return (
    <div className="card">
      <h2>Execute alert job</h2>
      <p>This calls the backend batch job (notifications depend on SMTP or SMS settings).</p>
      <button className="primary" type="button" onClick={() => void run()}>
        Run now
      </button>
      {msg && <p>{msg}</p>}
    </div>
  );
}
