import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "../api/client";

const schema = z.object({
  name: z.string().min(1),
  email: z.union([z.string().email(), z.literal("")]),
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
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone_e164: "",
      lat: 0,
      lon: 0,
      rain_pop_threshold: 0.5,
      channel: "email",
    },
  });

  const onSubmit = async (v: FormValues) => {
    const body = {
      name: v.name,
      email: v.email || null,
      phone_e164: v.phone_e164 || null,
      lat: v.lat,
      lon: v.lon,
      rain_pop_threshold: v.rain_pop_threshold,
      channel: v.channel,
    };
    await api.post("/users", body);
    reset();
    onCreated();
  };

  return (
    <form className="card" onSubmit={handleSubmit(onSubmit)}>
      <h2>Add user</h2>
      <div className="row">
        <label>Name</label>
        <input {...register("name")} />
        {errors.name && <span className="error">{errors.name.message}</span>}
      </div>
      <div className="row">
        <label>Email</label>
        <input type="email" {...register("email")} />
      </div>
      <div className="row">
        <label>Phone E164</label>
        <input {...register("phone_e164")} placeholder="+15551234567" />
      </div>
      <div className="row">
        <label>Latitude</label>
        <input type="number" step="any" {...register("lat")} />
        <label>Longitude</label>
        <input type="number" step="any" {...register("lon")} />
      </div>
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
        Save
      </button>
    </form>
  );
}
