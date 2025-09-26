import axios from "axios";
import { apiUrl } from "@/utils/env";
import router from "@/router";
import { notification } from "ant-design-vue";
import { getAccessToken } from "@/utils/safeStorage";

// Các endpoint auth để tránh logout vòng lặp
const AUTH_PATHS = ["/login", "/auth/login", "/me", "/refresh"];

const api = axios.create({
  baseURL: apiUrl, // ví dụ: 'http://portal.vinhgiapottery.com/api'
  timeout: 10000,
});

// 🧱 REQUEST: gắn Bearer token nếu có
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      if (!config.headers) config.headers = {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isLoggingOut = false;

// 🧱 RESPONSE: xử lý lỗi mạng + 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const response = error.response;
    const cfg = error.config || {};

    // Nếu lỗi mạng (timeout, server không phản hồi)
    if (!response) {
      notification.error({
        message: "Mạng hoặc máy chủ không phản hồi",
        description: "Vui lòng kiểm tra kết nối hoặc thử lại sau.",
      });
      return Promise.reject(error);
    }

    // Bỏ qua nếu request này có skipAuthInterceptor
    if (cfg.skipAuthInterceptor) {
      return Promise.reject(error);
    }

    // Bỏ qua 401 cho chính các call auth
    const url = (cfg.url || "").toString();
    if (AUTH_PATHS.some((p) => url.includes(p))) {
      return Promise.reject(error);
    }

    if (response.status === 401 && !isLoggingOut) {
      isLoggingOut = true;

      try {
        const { useAuthStore } = await import("@/stores/auth");
        const auth = useAuthStore();

        await auth.logout(false);

        notification.error({
          message: "Phiên đăng nhập đã hết hạn",
          description: "Vui lòng đăng nhập lại để tiếp tục.",
        });

        if (router.currentRoute.value.name !== "login") {
          router.push({ name: "login" });
        }
      } finally {
        setTimeout(() => {
          isLoggingOut = false;
        }, 3000);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
