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
  const rainPopThreshold = watch("rain_pop_threshold");

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
      setError(err.response?.data?.detail || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-4">
      <div className="bg-[#0f1423] border border-slate-800 rounded-2xl p-8 lg:p-10 shadow-2xl">
        <header className="mb-10">
          <h1 className="text-2xl font-bold text-slate-100">Create Account</h1>
          <p className="text-slate-400 text-sm mt-2">Set up your location and notification preferences</p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {error && (
            <div className="lg:col-span-2 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm text-center font-medium">
              {error}
            </div>
          )}
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
              <input 
                {...register("name")} 
                className="w-full bg-[#0b0f1a] border-slate-800 focus:border-sky-500/50 py-2.5 px-4 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500/50" 
                placeholder="John Doe"
              />
              {errors.name && <span className="text-xs text-red-400 font-medium ml-1">{errors.name.message}</span>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
              <input 
                type="email" 
                {...register("email")} 
                className="w-full bg-[#0b0f1a] border-slate-800 focus:border-sky-500/50 py-2.5 px-4 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500/50" 
                placeholder="you@example.com"
              />
              {errors.email && <span className="text-xs text-red-400 font-medium ml-1">{errors.email.message}</span>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Password</label>
              <input 
                type="password" 
                {...register("password")} 
                className="w-full bg-[#0b0f1a] border-slate-800 focus:border-sky-500/50 py-2.5 px-4 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500/50" 
                placeholder="••••••••"
              />
              {errors.password && <span className="text-xs text-red-400 font-medium ml-1">{errors.password.message}</span>}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Alert Sensitivity</label>
                <span className="text-xs font-bold text-sky-500">{Math.round(rainPopThreshold * 100)}% POP</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05" 
                {...register("rain_pop_threshold")} 
                className="w-full accent-sky-500 mt-2 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer" 
              />
              <p className="text-[10px] text-slate-500 italic mt-1 ml-1">You will be notified when rain probability exceeds this value.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Notification Channel</label>
              <select 
                {...register("channel")} 
                className="w-full bg-[#0b0f1a] border-slate-800 focus:border-sky-500/50 py-2.5 px-4 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500/50 appearance-none"
              >
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="both">Both Email & SMS</option>
              </select>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2 flex flex-col h-full">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Select Location</label>
              <div className="flex-1 min-h-[350px]">
                <MapPicker 
                  lat={lat} 
                  lon={lon} 
                  onChange={(newLat, newLon) => {
                    setValue("lat", newLat);
                    setValue("lon", newLon);
                  }} 
                />
              </div>
              {errors.lat && <span className="text-xs text-red-400 font-medium ml-1 mt-2">Please select your location on the map.</span>}
            </div>
          </div>

          <div className="lg:col-span-2 pt-4">
            <button 
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-slate-700" 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </button>
            <p className="text-center text-xs text-slate-500 mt-6">
               Already have an account? <Link to="/login" className="text-sky-500 hover:text-sky-400 transition-colors font-medium">Login</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
