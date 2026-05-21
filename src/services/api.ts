import axios from "axios";
import type { LoginResponse } from "../Types/global-types";
import AuthService from "./auth.service";
import { resolveApiBaseUrl } from "../utils/resolveApiBaseUrl";


/** One in-flight refresh so parallel 401s do not stampede /api/auth/refresh. */
let refreshFlight: Promise<LoginResponse> | null = null;

function refreshAccessToken(): Promise<LoginResponse> {
  if (!refreshFlight) {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      return Promise.reject(new Error("No refresh token"));
    }
    refreshFlight = AuthService.refresh(refreshToken).finally(() => {
      refreshFlight = null;
    });
  }
  return refreshFlight;
}

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  withCredentials: false,
  timeout: 30_000,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };
    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (originalRequest.skipAuthRefresh) {
      return Promise.reject(error);
    }

    const reqUrl = String(originalRequest.url ?? "");
    if (reqUrl.includes("/api/auth/login") || reqUrl.includes("/api/auth/register")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        AuthService.clearLocalSession();
        if (!window.location.pathname.startsWith("/login")) {
          window.location.replace("/login");
        }
        return Promise.reject(error);
      }

      try {
        const data = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch {
        AuthService.clearLocalSession();
        if (!window.location.pathname.startsWith("/login")) {
          window.location.replace("/login");
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
