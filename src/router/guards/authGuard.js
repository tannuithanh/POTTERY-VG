import { useAuthStore } from "@/stores/auth";
import { notification } from "ant-design-vue";

export function handleAuthGuard(to, from, next) {
  const publicPages = ["login", "LoginPage","forgotPassword"];
  const authRequired = !publicPages.includes(to.name);

  const auth = useAuthStore();
  const isLoggedIn = !!auth.token && auth.token !== "null";

  if (authRequired && !isLoggedIn) {
    notification.warning({
      message: "Bạn chưa đăng nhập",
      description: "Vui lòng đăng nhập để tiếp tục.",
    });
    next({ name: "login", query: { redirect: to.fullPath } });
    return false; // Ngăn không cho xử lý tiếp
  }

  return true; // Cho phép xử lý tiếp
}
