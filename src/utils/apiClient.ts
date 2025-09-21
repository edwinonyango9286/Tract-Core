import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig, RawAxiosRequestHeaders } from "axios";

const base_url: string = import.meta.env.VITE_BASE_URL ?? "";
console.log(base_url, "=> baseurlhere.......");

interface CustomHeaders extends RawAxiosRequestHeaders {
  Accept: "application/json";
  "Content-Type": "application/json";
}

interface CustomAxiosConfig extends AxiosRequestConfig {
  withCredentials: true;
  timeout: number;
  headers: CustomHeaders;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: base_url,
  // timeout: 10000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  withCredentials: true,
} as CustomAxiosConfig);
