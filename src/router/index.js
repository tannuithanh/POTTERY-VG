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
// import News from "@/pages/setting/components/news_manager/index.vue";
import CreateNews from "@/pages/news/CreateNews.vue";
import LeaveForm from "@/pages/forms/leaveForm/LeaveForm.vue";
import LoginPage from "@/pages/login/LoginPage.vue";

//Quản lý chức năng
import ModuleSetting from "@/pages/module_manager/index.vue";

import { handlePermissionGuard } from "./guards/permissionGuard";
import { handleAuthGuard } from "./guards/authGuard";
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
        component: SettingLayouts,
        meta: { title: "Cài đặt hệ thống" , moduleCode: "user_manager_module"},
        children: [
          {
            path: "decentralization_manager",
            name: "Decentralization",
            component: DecentralizationManager,
            meta: { title: "Quản lý phân quyền", requiresAdmin: true },
          },
          {
            path: "role_permission_manager",
            name: "rolePermissionManager",
            component: RolePermissionManager,
            meta: { title: "Quản lý phân quyền và vai trò", requiresAdmin: true },
          },
          {
            path: "user_manager",
            name: "userManager",
            component: UserManager,
            meta: { title: "Quản lý người dùng",  moduleCode: "user_manager_module"},
          },
          {
            path: "department_manager",
            name: "departmentManager",
            component: DepartmentManager,
            meta: {
              title: "Quản lý phòng ban",
              requiresAdmin: true
            },
          },
          {
            path: "module_manager",
            name: "moduleManager",
            component: ModuleManager,
            meta: { title: "Quản lý chức năng", requiresAdmin: true  },
          },
        ],
      },
      {
        path: '/module-management',
        name: 'ModuleManagement',
        component: ModuleSetting,
        meta: { title: 'Quản lý chức năng', requiresAdmin: true  }
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
            meta: { title: "Biểu mẫu giấy ra vào cổng", moduleCode: "form_module" },
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

router.beforeEach((to, from, next) => {
  const passed = handleAuthGuard(to, from, next);
  if (!passed) return;

  handlePermissionGuard(to, from, next);
});

router.afterEach((to) => {
  if (to.meta?.title) {
    document.title = to.meta.title;
  }
});

export default router;
