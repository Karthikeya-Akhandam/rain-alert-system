import { Link, Route, Routes } from "react-router-dom";
import { DashboardPage } from "./pages/DashboardPage";
import { RunNowPage } from "./pages/RunNowPage";
import { UsersPage } from "./pages/UsersPage";

export default function App() {
  return (
    <div className="layout">
      <header className="header">
        <h1>Smart Rain Alert</h1>
        <nav>
          <Link to="/">Users</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/run">Run now</Link>
        </nav>
      </header>
      <main className="main">
        <Routes>
          <Route path="/" element={<UsersPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/run" element={<RunNowPage />} />
        </Routes>
      </main>
    </div>
  );
}
