import axios, { type AxiosInstance } from "axios";

const TOKEN_STORAGE = "rain_alert_token";

export function getToken(): string {
  return localStorage.getItem(TOKEN_STORAGE) ?? "";
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_STORAGE, token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_STORAGE);
}

export function createApiClient(): AxiosInstance {
  const base = import.meta.env.VITE_API_BASE ?? "";
  const client = axios.create({
    baseURL: base || "http://localhost:8000",
    timeout: 30000,
  });
  client.interceptors.request.use((config) => {
    const t = getToken();
    if (t) {
      config.headers["Authorization"] = `Bearer ${t}`;
    }
    return config;
  });
  return client;
}

export const api = createApiClient();
