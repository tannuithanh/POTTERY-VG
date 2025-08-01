import axios from "axios";
import { notificationUrl } from "@/utils/env";

const notificationApi = axios.create({
  baseURL: notificationUrl,
  timeout: 50000,
});

notificationApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default notificationApi;
