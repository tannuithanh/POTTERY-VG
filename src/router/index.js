import { createRouter, createWebHistory } from "vue-router";
import MainLayout from "@/layouts/MainLayout.vue";

import FormLayouts from "@/pages/forms/FormLayouts.vue";
import SettingLayouts from "@/pages/setting/SettingLayouts.vue";
import HomeLayouts from "@/pages/home/HomeLayouts.vue";
import ProfileLayouts from "@/pages/profile/ProfileLayouts.vue";
//Quản lý nhân sự
import UserManager from "@/pages/setting/components/user_manager/index.vue";
//Quản lý phòng ban
import DepartmentManager from "@/pages/setting/components/department_manager/index.vue";
//Quản lý chức năng
import ModuleManager from "@/pages/setting/components/module_manager/index.vue";
//Quản lý vai trò và phân quyền
import RolePermissionManager from "@/pages/setting/components/role_permission_manager/index.vue";
//Quản lý phân quyền
import DecentralizationManager from "@/pages/setting/components/decentralization/index.vue";
//Quản lý bảng tin
import News from "@/pages/setting/components/news_manager/index.vue";
import CreateNews from "@/pages/news/CreateNews.vue";
import LeaveForm from "@/pages/forms/leaveForm/LeaveForm.vue";
import LoginPage from "@/pages/login/LoginPage.vue";
import { useAuthStore } from "@/stores/auth";
import { notification } from "ant-design-vue";

const routes = [
  {
    path: "/",
    component: MainLayout,
    children: [
      {
        path: "",
        name: "dashboard",
        component: HomeLayouts,
        meta: { title: "Trang chủ" },
      },
      {
        path: "/forms",
        name: "formsLayout",
        component: FormLayouts,
        meta: { title: "Mẫu đăng ký" },
      },
      {
        path: "/settings",
        redirect: "/settings/user_manager",
      },
      {
        path: "/settings",
        component: SettingLayouts,
        meta: { title: "Cài đặt hệ thống" },
        children: [
          {
            path: "decentralization_manager",
            name: "Decentralization",
            component: DecentralizationManager,
            meta: { title: "Quản lý phân quyền" },
          },
          {
            path: "role_permission_manager",
            name: "rolePermissionManager",
            component: RolePermissionManager,
            meta: { title: "Quản lý phân quyền và vai trò" },
          },
          {
            path: "user_manager",
            name: "userManager",
            component: UserManager,
            meta: { title: "Quản lý người dùng" },
          },
          {
            path: "department_manager",
            name: "departmentManager",
            component: DepartmentManager,
            meta: { title: "Quản lý phòng ban" },
          },
          {
            path: "module_manager",
            name: "moduleManager",
            component: ModuleManager,
            meta: { title: "Quản lý chức năng" },
          },
          {
            path: "news_manager",
            name: "newsManager",
            component: News,
            meta: { title: "Quản lý bảng tin" },
          },
        ],
      },
      {
        path: "/profile",
        name: "profile",
        component: ProfileLayouts,
        meta: { title: "Thông tin người dùng" },
      },
      {
        path: "/create_news",
        name: "createNews",
        component: CreateNews,
        meta: { title: "Tạo bảng tin" },
      },
      {
        path: "/forms_create",
        name: "formCreate",
        component: FormLayouts,
        meta: { title: "Tạo hồ sơ điện tử" },
        children: [
          {
            path: "leave_form",
            name: "leave_Form",
            component: LeaveForm,
            meta: { title: "Biểu mẫu giấy ra vào cổng" },
          },
        ],
      },
    ],
  },
  {
    path: "/login",
    name: "login",
    component: LoginPage,
    meta: { title: "Đăng nhập" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});
// 🛡️ Check login trước khi vào mỗi route
router.beforeEach((to, from, next) => {
  const publicPages = ['/login']
  const authRequired = !publicPages.includes(to.path)

  const auth = useAuthStore()
  const isLoggedIn = !!auth.token // ✅ KHÔNG cần storeToRefs

  if (authRequired && !isLoggedIn) {
    notification.warning({
      message: 'Bạn chưa đăng nhập',
      description: 'Vui lòng đăng nhập để tiếp tục.'
    })

    return next({ path: '/login', query: { redirect: to.fullPath } })
  }

  next()
})

router.afterEach((to) => {
  if (to.meta?.title) {
    document.title = to.meta.title;
  }
});

export default router;
