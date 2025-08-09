import { createRouter, createWebHistory } from "vue-router";
import MainLayout from "@/layouts/MainLayout.vue";

import { handlePermissionGuard } from "./guards/permissionGuard";
import { handleAuthGuard } from "./guards/authGuard";

import dashboardRoutes from "./modules/dashboard.routes";
import formRoutes from "./modules/form.routes";
import newsRoutes from "./modules/news.routes";
import settingsRoutes from "./modules/settings.routes";
import moduleRoutes from "./modules/module.routes";
import authRoutes from "./modules/auth.routes";
import notifacationRoutes from "./modules/notifacation.routes";
import meetingRoutes from "./modules/meeting.routes";

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      ...dashboardRoutes,
      ...formRoutes,
      ...newsRoutes,
      ...settingsRoutes,
      ...moduleRoutes,
      ...notifacationRoutes,
      ...meetingRoutes
    ],
  },
  ...authRoutes,
]

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
