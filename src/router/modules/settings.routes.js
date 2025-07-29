import SettingLayouts from "@/pages/setting/SettingLayouts.vue";
import UserManager from "@/pages/setting/components/user_manager/index.vue";
import DepartmentManager from "@/pages/setting/components/department_manager/index.vue";
import ModuleManager from "@/pages/setting/components/module_manager/index.vue";
import RolePermissionManager from "@/pages/setting/components/role_permission_manager/index.vue";
import DecentralizationManager from "@/pages/setting/components/decentralization/index.vue";
import ProfileLayouts from "@/pages/profile/ProfileLayouts.vue";

export default [
  {
    path: "/profile",
    name: "profile",
    component: ProfileLayouts,
    meta: { title: "Thông tin người dùng" },
  },
  {
    path: "/settings",
    component: SettingLayouts,
    meta: { title: "Cài đặt hệ thống", moduleCode: "user_manager_module" },
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
        meta: {
          title: "Quản lý người dùng",
          moduleCode: "user_manager_module",
        },
      },
      {
        path: "department_manager",
        name: "departmentManager",
        component: DepartmentManager,
        meta: {
          title: "Quản lý phòng ban",
          requiresAdmin: true,
        },
      },
      {
        path: "module_manager",
        name: "moduleManager",
        component: ModuleManager,
        meta: { title: "Quản lý chức năng", requiresAdmin: true },
      },
    ],
  },
];
