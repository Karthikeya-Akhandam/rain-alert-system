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
      // After signup, login to get token
      const loginData = new FormData();
      loginData.append("username", v.email);
      loginData.append("password", v.password);
      
      const loginResp = await api.post("/auth/login", loginData);
      setToken(loginResp.data.access_token);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Signup failed");
    }
  };

  return (
    <div className="auth-container">
      <form className="card" onSubmit={handleSubmit(onSubmit)}>
        <h2>Create Account</h2>
        {error && <p className="error">{error}</p>}
        
        <div className="row">
          <label>Name</label>
          <input {...register("name")} />
          {errors.name && <span className="error">{errors.name.message}</span>}
        </div>

        <div className="row">
          <label>Email</label>
          <input type="email" {...register("email")} />
          {errors.email && <span className="error">{errors.email.message}</span>}
        </div>

        <div className="row">
          <label>Password</label>
          <input type="password" {...register("password")} />
          {errors.password && <span className="error">{errors.password.message}</span>}
        </div>

        <div className="row" style={{ flexDirection: "column", alignItems: "flex-start" }}>
          <label>Location (Select on Map)</label>
          <MapPicker 
            lat={lat} 
            lon={lon} 
            onChange={(newLat, newLon) => {
              setValue("lat", newLat);
              setValue("lon", newLon);
            }} 
          />
          {errors.lat && <span className="error">Please select a location on the map</span>}
        </div>

        <div className="row">
          <label>Rain probability threshold ({Math.round(watch("rain_pop_threshold") * 100)}%)</label>
          <input type="range" min="0" max="1" step="0.05" {...register("rain_pop_threshold")} />
        </div>

        <div className="row">
          <label>Notification Channel</label>
          <select {...register("channel")}>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="both">Both</option>
          </select>
        </div>

        <button className="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Sign Up"}
        </button>
        
        <p style={{ marginTop: "1rem", textAlign: "center" }}>
          Already have an account? <Link to="/login">Log In</Link>
        </p>
      </form>
    </div>
  );
}
