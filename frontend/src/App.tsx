import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { DashboardPage } from "./pages/DashboardPage";
import { RunNowPage } from "./pages/RunNowPage";
import { UsersPage } from "./pages/UsersPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { getToken, removeToken } from "./api/client";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = getToken();
  return token ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  const navigate = useNavigate();
  const token = getToken();

  const handleLogout = () => {
    removeToken();
    navigate("/login");
  };

  return (
    <div className="layout">
      <header className="header">
        <h1>Smart Rain Alert</h1>
        <nav>
          {token ? (
            <>
              <Link to="/">Dashboard</Link>
              <Link to="/settings">Settings</Link>
              <Link to="/admin/users">Users (Admin)</Link>
              <Link to="/admin/run">Run (Admin)</Link>
              <button onClick={handleLogout} className="link-button">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Signup</Link>
            </>
          )}
        </nav>
      </header>
      <main className="main">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><UsersPage /></PrivateRoute>} />
          
          {/* Admin routes could be more strictly protected, but keeping it simple for now */}
          <Route path="/admin/users" element={<PrivateRoute><UsersPage /></PrivateRoute>} />
          <Route path="/admin/run" element={<PrivateRoute><RunNowPage /></PrivateRoute>} />
        </Routes>
      </main>
    </div>
  );
}
