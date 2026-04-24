import { useEffect, useState } from "react";
import { api } from "../api/client";
import { RunSummaryCard } from "../components/RunSummaryCard";

type RunSummary = {
  id: number;
  started_at: string;
  finished_at: string | null;
  users_processed: number;
  alerts_sent: number;
  alerts_failed: number;
  api_failures: number;
  status: string;
};

export function DashboardPage() {
  const [run, setRun] = useState<RunSummary | null>(null);
  const [metrics, setMetrics] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    void (async () => {
      const [runsRes, metRes] = await Promise.all([
        api.get<RunSummary[]>("/runs"),
        api.get<Record<string, number>>("/metrics"),
      ]);
      setRun(runsRes.data[0] ?? null);
      setMetrics(metRes.data);
    })();
  }, []);

  return (
    <div>
      <RunSummaryCard run={run} />
      {metrics && (
        <div className="card">
          <h2>Metrics</h2>
          <pre>{JSON.stringify(metrics, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
