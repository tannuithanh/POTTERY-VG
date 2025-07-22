import axios from "axios";
import { formApiUrl } from "@/utils/env";

const formApi = axios.create({
  baseURL: formApiUrl,
  timeout: 10000,
});

formApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default formApi;
