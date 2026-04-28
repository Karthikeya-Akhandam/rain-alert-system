import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { api, setToken } from "../api/client";
import { useState } from "react";

export function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  const onSubmit = async (data: any) => {
    setError(null);
    try {
      const formData = new FormData();
      formData.append("username", data.email);
      formData.append("password", data.password);
      
      const resp = await api.post("/auth/login", formData);
      setToken(resp.data.access_token);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Authentication sequence failed. Check credentials.");
    }
  };

  return (
    <div className="auth-container p-4">
      <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800/60 rounded-3xl p-10 w-full max-max-md shadow-2xl shadow-sky-950/20">
        <div className="flex justify-center mb-8">
          <div className="bg-sky-500/20 p-4 rounded-2xl border border-sky-500/30">
            <span className="material-icons text-sky-400 text-4xl block leading-none">thunderstorm</span>
          </div>
        </div>
        
        <header className="text-center mb-10">
          <h2 className="text-2xl font-black tracking-tighter uppercase italic glow-text">Initialize Uplink</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Enter credentials to establish secure connection</p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs font-bold uppercase tracking-widest text-center italic">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Operator Identifier (Email)</label>
            <input 
              type="email" 
              {...register("email", { required: true })} 
              className="bg-slate-950/50 border-slate-800 focus:border-sky-500/50 py-3 rounded-xl transition-all"
              placeholder="operator@central.grid"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Access Protocol (Password)</label>
            <input 
              type="password" 
              {...register("password", { required: true })} 
              className="bg-slate-950/50 border-slate-800 focus:border-sky-500/50 py-3 rounded-xl transition-all"
              placeholder="••••••••"
            />
          </div>

          <button 
            className="w-full bg-sky-600 hover:bg-sky-500 text-white font-black uppercase tracking-[0.2em] py-4 rounded-xl transition-all shadow-xl shadow-sky-900/20" 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Establishing Uplink..." : "Connect to Grid"}
          </button>
          
          <p className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Unregistered Operator? <Link to="/signup" className="text-sky-500 hover:text-sky-400 transition-colors ml-1">Request Grid Access</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
