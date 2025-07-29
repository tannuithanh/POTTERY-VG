import axios from "axios";
import { newsApiUrl } from "@/utils/env";

const newsApi = axios.create({
  baseURL: newsApiUrl,
  timeout: 10000,
});

newsApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default newsApi;
