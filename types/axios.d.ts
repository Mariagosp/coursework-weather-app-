import "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    authStrategy?: "jwt" | "api-key" | "none";
    apiKey?: string;
  }
}