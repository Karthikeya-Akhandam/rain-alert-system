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
      setError(err.response?.data?.detail || "Login failed. Check your credentials.");
    }
  };

  return (
    <div className="auth-container">
      <form className="card" onSubmit={handleSubmit(onSubmit)}>
        <h2>Log In</h2>
        {error && <p className="error">{error}</p>}
        
        <div className="row">
          <label>Email</label>
          <input type="email" {...register("email", { required: true })} />
        </div>

        <div className="row">
          <label>Password</label>
          <input type="password" {...register("password", { required: true })} />
        </div>

        <button className="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Log In"}
        </button>
        
        <p style={{ marginTop: "1rem", textAlign: "center" }}>
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </form>
    </div>
  );
}
