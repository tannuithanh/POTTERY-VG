import axios from "axios";
import { meetingUrl } from "@/utils/env";

const meetingScheduleApi = axios.create({
  baseURL: meetingUrl,
  timeout: 50000,
});

meetingScheduleApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default meetingScheduleApi;
