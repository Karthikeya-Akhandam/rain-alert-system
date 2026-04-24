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

export function RunSummaryCard({ run }: { run: RunSummary | null }) {
  if (!run) return <p>No runs yet.</p>;
  return (
    <div className="card">
      <h2>Latest run #{run.id}</h2>
      <p>Status: {run.status}</p>
      <p>Users processed: {run.users_processed}</p>
      <p>Alerts sent: {run.alerts_sent}</p>
      <p>Alerts failed: {run.alerts_failed}</p>
      <p>API failures: {run.api_failures}</p>
    </div>
  );
}
