import { useAuthStore } from "@/stores/auth";
import { notification } from "ant-design-vue";

export function handlePermissionGuard(to, from, next) {
  const auth = useAuthStore();
  // 🛑 Nếu yêu cầu admin mà user không phải admin
  if (to.meta?.requiresAdmin && !auth.user?.is_admin) {
    notification.error({
      message: "Truy cập bị từ chối",
      description: "Chỉ admin mới có quyền truy cập chức năng này.",
    });
    return;
  }

  // ✅ Admin thì skip kiểm tra quyền module
  if (auth.user?.is_admin) return next();

  // 🟡 Kiểm tra moduleCode nếu có
  const moduleCode = to.meta?.moduleCode;
  if (moduleCode) {
    const hasAccess = auth.modules.some((m) => m.code === moduleCode);
    if (!hasAccess) {
      notification.error({
        message: "Không có quyền truy cập",
        description: "Bạn không được phép truy cập chức năng này.",
      });
      return
    }
  }

  next();
}

