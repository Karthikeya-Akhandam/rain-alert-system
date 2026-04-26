import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "../api/client";
import { MapPicker } from "./MapPicker";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8).optional().or(z.literal("")),
  phone_e164: z.union([z.string().max(20), z.literal("")]),
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  rain_pop_threshold: z.coerce.number().min(0).max(1),
  channel: z.enum(["email", "sms", "both"]),
});

type FormValues = z.infer<typeof schema>;

export function UserForm({ onCreated }: { onCreated: () => void }) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone_e164: "",
      lat: 0,
      lon: 0,
      rain_pop_threshold: 0.5,
      channel: "email",
    },
  });

  const lat = watch("lat");
  const lon = watch("lon");

  const onSubmit = async (v: FormValues) => {
    // This form is now used by admin to create users
    await api.post("/users", v);
    reset();
    onCreated();
  };

  return (
    <form className="card" onSubmit={handleSubmit(onSubmit)}>
      <h2>Add user (Admin)</h2>
      <div className="row">
        <label>Name</label>
        <input {...register("name")} />
      </div>
      <div className="row">
        <label>Email</label>
        <input type="email" {...register("email")} />
      </div>
      <div className="row">
        <label>Password</label>
        <input type="password" {...register("password")} placeholder="At least 8 chars" />
      </div>
      <div className="row">
        <label>Phone E164</label>
        <input {...register("phone_e164")} />
      </div>
      
      <MapPicker 
        lat={lat} 
        lon={lon} 
        onChange={(newLat, newLon) => {
          setValue("lat", newLat);
          setValue("lon", newLon);
        }} 
      />

      <div className="row">
        <label>Rain pop threshold</label>
        <input type="number" step="0.05" {...register("rain_pop_threshold")} />
        <label>Channel</label>
        <select {...register("channel")}>
          <option value="email">email</option>
          <option value="sms">sms</option>
          <option value="both">both</option>
        </select>
      </div>
      <button className="primary" type="submit">
        Save User
      </button>
    </form>
  );
}
