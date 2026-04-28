import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { DashboardPage } from "./pages/DashboardPage";
import { RunNowPage } from "./pages/RunNowPage";
import { UsersPage } from "./pages/UsersPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { getToken, removeToken, api } from "./api/client";
import { useEffect, useState } from "react";

type UserInfo = {
  name: string;
  is_admin: boolean;
};

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = getToken();
  return token ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  const navigate = useNavigate();
  const token = getToken();
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    if (token) {
      void (async () => {
        try {
          const res = await api.get<UserInfo>("/users/me");
          setUser(res.data);
        } catch (e) {
          removeToken();
          navigate("/login");
        }
      })();
    } else {
      setUser(null);
    }
  }, [token, navigate]);

  const handleLogout = () => {
    removeToken();
    navigate("/login");
  };

  return (
    <div className="layout">
      {/* Persistent Ambient Background */}
      <div className="bg-ambient">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
      </div>

      <header className="header">
        <Link to="/" style={{ textDecoration: "none" }}>
          <h1>Smart Rain Alert</h1>
        </Link>
        <nav>
          {token ? (
            <>
              <Link to="/">Dashboard</Link>
              {user?.is_admin && (
                <>
                  <Link to="/admin/users">Users</Link>
                  <Link to="/admin/run">Jobs</Link>
                </>
              )}
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
          
          {/* Protected Routes */}
          <Route path="/admin/users" element={<PrivateRoute><UsersPage /></PrivateRoute>} />
          <Route path="/admin/run" element={<PrivateRoute><RunNowPage /></PrivateRoute>} />
          
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}
