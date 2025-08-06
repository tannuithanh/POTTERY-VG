
import ForgotPassword from "@/pages/login/ForgotPassword.vue";
import LoginPage from "@/pages/login/LoginPage.vue";

export default [

  {
    path: "/login",
    name: "login",
    component: LoginPage,
    meta: { title: "Đăng nhập" },
  },
    {
    path: "/forgot-password",
    name: "forgotPassword",
    component: ForgotPassword,
    meta: { title: "Quên mật khẩu" },
  },
];
