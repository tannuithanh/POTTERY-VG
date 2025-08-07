import { defineStore } from "pinia";
import api from "@/plugins/axios-user";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("access_token") || null,
    user: null,
    modules: [],
  }),
  persist: {
    paths: ["token", "user", "modules"], // 🆕 lưu 3 trường này
  },

  actions: {
    // 🟢 Đăng nhập
    async login({ email, password }) {
      try {
        const res = await api.post(
          "/login",
          { email, password },
          { skipAuthInterceptor: true }
        );
        this.token = res.data.access_token;

        // 🔐 Lưu token
        localStorage.setItem("access_token", this.token);
        api.defaults.headers.common.Authorization = `Bearer ${this.token}`;

        // 👤 Lấy user
        const me = await api.get("/me");
        this.user = me.data;
        this.modules = me.data.modules || [];

        return { success: true };
      } catch (err) {
        // Không throw nữa, trả về lỗi cụ thể
        return {
          success: false,
          message: err?.response?.data?.message || "Đăng nhập thất bại",
        };
      }
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

    // Đúng cú pháp method trong object
    async changePassword(payload) {
      return api.post("/change-password", payload);
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
    async changePasswordFistTime(data) {
      return api.post("/change-password-first-time", data);
    },
    // Gửi link khôi phục mật khẩu
    async forgotPassword(email) {
      try {
        await api.post("/forgot-password", { email });
        return {
          success: true,
          message: "Đã gửi liên kết đặt lại mật khẩu đến email.",
        };
      } catch (err) {
        const rawMessage = err.response?.data?.message || "";
        let message = "Đã xảy ra lỗi. Vui lòng thử lại.";

        if (rawMessage.includes("can't find a user")) {
          message = "Không tìm thấy người dùng với email này.";
        } else if (rawMessage.includes("wait before retrying")) {
          message =
            "Bạn đã gửi quá nhiều yêu cầu. Vui lòng đợi một lúc rồi thử lại.";
        } else if (rawMessage.includes("The email field is required")) {
          message = "Vui lòng nhập địa chỉ email.";
        } else if (
          rawMessage.includes("The email must be a valid email address")
        ) {
          message = "Địa chỉ email không hợp lệ.";
        }

        return {
          success: false,
          message,
        };
      }
    },

    // Đặt lại mật khẩu mới với token từ email
    async resetPassword(payload) {
      try {
        await api.post("/reset-password", payload);
        return {
          success: true,
          message: "Đặt lại mật khẩu thành công.",
        };
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || "Không thể đặt lại mật khẩu.",
        };
      }
    },
  },
});
