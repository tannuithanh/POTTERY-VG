import ModuleSetting from "@/pages/module_manager/index.vue";

export default [
  {
    path: "/module-management",
    name: "ModuleManagement",
    component: ModuleSetting,
    meta: { title: "Quản lý chức năng", requiresAdmin: true },
  },
];
