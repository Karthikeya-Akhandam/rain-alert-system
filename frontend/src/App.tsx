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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50 font-sans selection:bg-sky-500/30">
      {/* Background Orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-[radial-gradient(circle_at_50%_50%,#0f172a_0%,#020617_100%)]">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-sky-500/20 blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/20 blur-[100px] animate-pulse [animation-delay:2s]"></div>
      </div>

      {/* Header */}
      <header className="border-b border-slate-800/60 p-4 flex justify-between items-center bg-slate-900/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-sky-500/20 p-2 rounded-lg border border-sky-500/30">
            <span className="material-icons text-sky-400 block leading-none">thunderstorm</span>
          </div>
          <Link to="/" className="no-underline">
            <h1 className="text-xl font-bold tracking-tighter bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent glow-text">
              SMART RAIN ALERT
            </h1>
          </Link>
        </div>

        {token && (
          <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-400">
            <Link to="/" className="hover:text-sky-400 transition-colors">Op-Center</Link>
            {user?.is_admin && (
              <>
                <Link to="/admin/users" className="hover:text-sky-400 transition-colors">Operator Grid</Link>
                <Link to="/admin/run" className="hover:text-sky-400 transition-colors">Mission Execution</Link>
              </>
            )}
          </nav>
        )}

        <div className="flex items-center gap-4">
          {token ? (
            <button 
              onClick={handleLogout} 
              className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors flex items-center gap-2"
            >
              Terminate Session <span className="material-icons text-sm">logout</span>
            </button>
          ) : (
            <div className="flex gap-4">
              <Link to="/login" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Login</Link>
              <Link to="/signup" className="text-sm font-bold bg-sky-600 hover:bg-sky-500 text-white px-4 py-1.5 rounded-lg transition-all shadow-lg shadow-sky-900/20">Signup</Link>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {token && (
          <aside className="w-64 border-r border-slate-800/60 p-6 hidden lg:flex flex-col bg-slate-900/20 backdrop-blur-sm">
            <div className="mb-10">
              <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Navigation</h2>
              <p className="text-xs text-sky-500/80 font-mono flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-ping"></span> Uplink Active
              </p>
            </div>
            <ul className="space-y-4 flex-1">
              <li>
                <Link to="/" className="flex items-center gap-3 text-sm font-medium text-sky-400 bg-sky-500/10 p-2.5 rounded-xl border border-sky-500/20">
                  <span className="material-icons text-lg">dashboard</span> Dashboard
                </Link>
              </li>
              {user?.is_admin && (
                <>
                  <li>
                    <Link to="/admin/users" className="flex items-center gap-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 p-2.5 rounded-xl transition-all">
                      <span className="material-icons text-lg">people</span> Operators
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/run" className="flex items-center gap-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 p-2.5 rounded-xl transition-all">
                      <span className="material-icons text-lg">terminal</span> Manual Override
                    </Link>
                  </li>
                </>
              )}
            </ul>
            <div className="pt-6 border-t border-slate-800/60">
              <div className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center font-bold text-xs">
                  {user?.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">{user?.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user?.is_admin ? 'ADMIN_ACCESS' : 'OPERATOR_LEVEL_1'}</p>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 relative overflow-y-auto bg-slate-950/50">
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
    </div>
  );
}
