import { defineStore } from "pinia";
import api from "@/plugins/axios";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("access_token") || null,
    user: null,
    modules: []
  }),

  actions: {
    // 🟢 Đăng nhập
    async login({ email, password }) {
      const res = await api.post("/login", { email, password });
      this.token = res.data.access_token;

      // 🔐 Lưu token
      localStorage.setItem("access_token", this.token);
      api.defaults.headers.common.Authorization = `Bearer ${this.token}`;

      // 👤 Lấy user
      const me = await api.get("/me");
      this.user = me.data;
      this.modules = me.data.modules || [];
    },

    // 🔐 Tải lại thông tin user (nếu đã có token)
    async fetchMe() {
      if (!this.token) return;
      api.defaults.headers.common.Authorization = `Bearer ${this.token}`;

      try {
        const res = await api.get("/me");
        this.user = res.data;
      } catch (err) {
        this.logout(); // Token hết hạn hoặc lỗi -> auto logout
      }
    },

    // 🔴 Đăng xuất
    async logout() {
      try {
        await api.post("/logout");
      } catch (_) {}

      this.token = null;
      this.user = null;
      localStorage.removeItem("access_token");
      delete api.defaults.headers.common.Authorization;
    },

    // Upload avatar
    async uploadAvatar(file) {
      const formData = new FormData();
      formData.append("avatar", file);

      try {
        const res = await api.post("/users/user/avatar", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        // Cập nhật vào store
        this.user.avatar = res.data.avatar_url;

        // Trả về kết quả thành công
        return { success: true, data: res.data };
      } catch (err) {
        if (err.response?.status === 422) {
          return {
            success: false,
            error:
              err.response.data.errors?.avatar?.[0] || "Dữ liệu không hợp lệ",
          };
        }

        return {
          success: false,
          error: "Upload thất bại. Vui lòng thử lại sau.",
        };
      }
    },

    // Upload chữ ký
    async uploadSignature(file) {
      const formData = new FormData();
      formData.append("signature", file);

      try {
        const res = await api.post("/users/user/signature", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        this.user.signature = res.data.signature_url;
        return { success: true };
      } catch (err) {
        const msg =
          err.response?.data?.errors?.signature?.[0] || "Upload thất bại";
        return { success: false, error: msg };
      }
    },
  },
});
