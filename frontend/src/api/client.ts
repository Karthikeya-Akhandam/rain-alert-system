import axios, { type AxiosInstance } from "axios";

const ADMIN_KEY_STORAGE = "rain_alert_admin_key";

export function getAdminKey(): string {
  return localStorage.getItem(ADMIN_KEY_STORAGE) ?? "";
}

export function setAdminKey(key: string) {
  localStorage.setItem(ADMIN_KEY_STORAGE, key);
}

export function createApiClient(): AxiosInstance {
  const base = import.meta.env.VITE_API_BASE ?? "";
  const client = axios.create({
    baseURL: base || undefined,
    timeout: 30000,
  });
  client.interceptors.request.use((config) => {
    const k = getAdminKey();
    if (k) {
      config.headers["X-Admin-Key"] = k;
    }
    return config;
  });
  return client;
}

export const api = createApiClient();
