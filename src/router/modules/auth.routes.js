import ProfileLayouts from "@/pages/profile/ProfileLayouts.vue";
import LoginPage from "@/pages/login/LoginPage.vue";

export default [

  {
    path: "/login",
    name: "login",
    component: LoginPage,
    meta: { title: "Đăng nhập" },
  },
];
