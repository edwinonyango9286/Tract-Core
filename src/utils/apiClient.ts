import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig, RawAxiosRequestHeaders } from "axios";

const base_url: string = import.meta.env.VITE_BASE_URL ?? "";

interface CustomHeaders extends RawAxiosRequestHeaders {
  Accept: string;
  "Content-Type"?: string;
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


apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);