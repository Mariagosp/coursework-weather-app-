import axios, { InternalAxiosRequestConfig } from "axios";
import { getAuthToken } from "../services/authStorage";

export type AuthStrategy = "jwt" | "api-key" | "none";

export interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  authStrategy?: AuthStrategy;
  apiKey?: string;
}

const apiClient = axios.create();

apiClient.interceptors.request.use(
  async (config: CustomAxiosRequestConfig) => {
    const strategy = config.authStrategy || "none";

    if (strategy === "jwt") {
      const token = await getAuthToken();

      if (token) {
        config.headers.set("Authorization", `Bearer ${token}`);
      }
    }

    if (strategy === "api-key" && config.apiKey) {
      config.headers.set("x-api-key", config.apiKey);
    }

    console.log(`[API REQUEST]: ${config.method?.toUpperCase()} ${config.url}`);

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API RESPONSE]: ${response.status} ${response.config.url}`);

    return response;
  },
  (error) => {
    console.log(`[API ERROR]: ${error.response?.status}`);

    return Promise.reject(error);
  }
);

export default apiClient;
