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
      setError(err.response?.data?.detail || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="bg-[#0f1423] border border-slate-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <header className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-100">Welcome Back</h1>
          <p className="text-slate-400 text-sm mt-2">Sign in to your account</p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs font-medium text-center">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
            <input 
              type="email" 
              {...register("email", { required: true })} 
              className="w-full bg-[#0b0f1a] border-slate-800 focus:border-sky-500/50 py-2.5 px-4 rounded-lg text-slate-200 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-sky-500/50"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Password</label>
            <input 
              type="password" 
              {...register("password", { required: true })} 
              className="w-full bg-[#0b0f1a] border-slate-800 focus:border-sky-500/50 py-2.5 px-4 rounded-lg text-slate-200 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-sky-500/50"
              placeholder="••••••••"
            />
          </div>

          <button 
            className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:bg-slate-700" 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
          
          <p className="text-center text-xs text-slate-500">
            Don't have an account? <Link to="/signup" className="text-sky-500 hover:text-sky-400 transition-colors font-medium">Create one</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
