/// <reference types="vite/client" />
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { AUTH_ENDPOINTS } from "../lib/constants";

const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
export const apiClient = axios.create({
  baseURL: `${baseUrl}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

const isBrowser = typeof window !== "undefined";
const isAuthRequest = (url?: string): boolean =>
  url ? AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint)) : false;

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    console.log("Interceptor caught error", error);

    return (error.response?.status === 401 || error.response?.status === 429) &&
      !originalRequest._retry &&
      isBrowser
      ? () => {
          if (isBrowser) {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }
        }
      : Promise.reject(error);
  },
);

apiClient.interceptors.request.use((config) => {
  if (!isAuthRequest(config.url)) {
    const token = isBrowser ? localStorage.getItem("token") : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});
