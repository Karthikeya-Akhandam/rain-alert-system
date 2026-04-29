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
    <div className="min-h-screen flex flex-col bg-[#0b0f1a] text-slate-200 font-sans selection:bg-sky-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 p-4 flex justify-between items-center bg-[#0b0f1a] sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-sky-600/10 p-2 rounded-lg border border-sky-600/20">
            <span className="material-icons text-sky-500 block leading-none">thunderstorm</span>
          </div>
          <Link to="/" className="no-underline">
            <h1 className="text-xl font-bold tracking-tight text-slate-100">
              RainAlert
            </h1>
          </Link>
        </div>

        <div className="flex items-center gap-6">
          {token && (
            <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-400">
              <Link to="/" className="hover:text-slate-100 transition-colors">Dashboard</Link>
              {user?.is_admin && (
                <>
                  <Link to="/admin/users" className="hover:text-slate-100 transition-colors">Users</Link>
                  <Link to="/admin/run" className="hover:text-slate-100 transition-colors">Manual Run</Link>
                </>
              )}
            </nav>
          )}

          <div className="h-4 w-px bg-slate-800 hidden md:block"></div>

          {token ? (
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-slate-500 hidden sm:block">{user?.name}</span>
              <button 
                onClick={handleLogout} 
                className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-4">
              <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Login</Link>
              <Link to="/signup" className="text-sm font-semibold bg-sky-600 hover:bg-sky-500 text-white px-4 py-1.5 rounded-md transition-all">Signup</Link>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {token && (
          <aside className="w-64 border-r border-slate-800 p-6 hidden lg:flex flex-col bg-[#0b0f1a]">
            <nav className="space-y-1 flex-1">
              <Link to="/" className="flex items-center gap-3 text-sm font-medium text-slate-100 bg-slate-800/50 px-3 py-2 rounded-md">
                <span className="material-icons text-lg">dashboard</span> Dashboard
              </Link>
              {user?.is_admin && (
                <>
                  <Link to="/admin/users" className="flex items-center gap-3 text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/30 px-3 py-2 rounded-md transition-all">
                    <span className="material-icons text-lg">people</span> Users
                  </Link>
                  <Link to="/admin/run" className="flex items-center gap-3 text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/30 px-3 py-2 rounded-md transition-all">
                    <span className="material-icons text-lg">play_arrow</span> Manual Run
                  </Link>
                </>
              )}
            </nav>
            
            <div className="mt-auto pt-6 border-t border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-slate-800 flex items-center justify-center font-bold text-xs text-sky-500">
                  {user?.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">{user?.is_admin ? 'Admin' : 'User'}</p>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 relative overflow-y-auto bg-[#0b0f1a]">
          <div className="max-w-7xl mx-auto p-6 md:p-10">
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
          </div>
        </main>
      </div>
    </div>
  );
}
