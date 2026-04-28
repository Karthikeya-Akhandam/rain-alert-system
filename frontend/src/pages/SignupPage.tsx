import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { api, setToken } from "../api/client";
import { MapPicker } from "../components/MapPicker";
import { useState } from "react";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  rain_pop_threshold: z.coerce.number().min(0).max(1),
  channel: z.enum(["email", "sms", "both"]),
});

type FormValues = z.infer<typeof schema>;

export function SignupPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      lat: 0,
      lon: 0,
      rain_pop_threshold: 0.5,
      channel: "email",
    },
  });

  const lat = watch("lat");
  const lon = watch("lon");

  const onSubmit = async (v: FormValues) => {
    setError(null);
    try {
      await api.post("/auth/signup", v);
      const loginData = new FormData();
      loginData.append("username", v.email);
      loginData.append("password", v.password);
      
      const loginResp = await api.post("/auth/login", loginData);
      setToken(loginResp.data.access_token);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registry request denied");
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800/60 rounded-3xl p-8 lg:p-12 shadow-2xl shadow-sky-950/20">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
             <span className="material-icons text-sky-400">add_moderator</span>
             <h2 className="text-2xl font-black tracking-tighter uppercase italic glow-text">Register New Operator</h2>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Establish a localized monitoring sector in the global grid</p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
          {error && (
            <div className="lg:col-span-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs font-bold uppercase tracking-widest text-center italic">
              {error}
            </div>
          )}
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Full Name</label>
              <input {...register("name")} className="bg-slate-950/50 border-slate-800 focus:border-sky-500/50 py-3 rounded-xl transition-all" />
              {errors.name && <span className="text-[10px] text-rose-400 font-bold uppercase tracking-tighter italic ml-1">{errors.name.message}</span>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Grid Email</label>
              <input type="email" {...register("email")} className="bg-slate-950/50 border-slate-800 focus:border-sky-500/50 py-3 rounded-xl transition-all" />
              {errors.email && <span className="text-[10px] text-rose-400 font-bold uppercase tracking-tighter italic ml-1">{errors.email.message}</span>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Security Token (Password)</label>
              <input type="password" {...register("password")} className="bg-slate-950/50 border-slate-800 focus:border-sky-500/50 py-3 rounded-xl transition-all" />
              {errors.password && <span className="text-[10px] text-rose-400 font-bold uppercase tracking-tighter italic ml-1">{errors.password.message}</span>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Alert Sensitivity ({Math.round(watch("rain_pop_threshold") * 100)}%)</label>
              <input type="range" min="0" max="1" step="0.05" {...register("rain_pop_threshold")} className="accent-sky-500 mt-2" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Uplink Channel</label>
              <select {...register("channel")} className="bg-slate-950/50 border-slate-800 focus:border-sky-500/50 py-3 rounded-xl transition-all">
                <option value="email">Direct Email</option>
                <option value="sms">SMS Protocol</option>
                <option value="both">Dual Channel</option>
              </select>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2 flex flex-col h-full">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Sector Geolocation (Search & Click)</label>
              <div className="flex-1 min-h-[300px]">
                <MapPicker 
                  lat={lat} 
                  lon={lon} 
                  onChange={(newLat, newLon) => {
                    setValue("lat", newLat);
                    setValue("lon", newLon);
                  }} 
                />
              </div>
              {errors.lat && <span className="text-[10px] text-rose-400 font-bold uppercase tracking-tighter italic ml-1 mt-2">Precision coordinates required. Select on map.</span>}
            </div>
          </div>

          <div className="lg:col-span-2 pt-6">
            <button 
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl transition-all shadow-2xl shadow-sky-900/20" 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Establishing Protocol..." : "Finalize Grid Registration"}
            </button>
            <p className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-6">
               Already part of the grid? <Link to="/login" className="text-sky-500 hover:text-sky-400 transition-colors ml-1">Establish Uplink</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
