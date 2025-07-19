import api from "@/plugins/axios";

const permissionService = {
  // Lấy tất cả danh sách permission
  getAll() {
    return api.get("/permissions");
  },

  // Tạo mới permission theo module + action
  create(data) {
    return api.post("/permissions", data);
  },

  // Lấy tất cả danh sách permission theo id module
  getByModule(moduleId) {
    return api.get(`/permissions/by-module/${moduleId}`);
  },

  // Thêm module vs role
  createPermission(data) {
    return api.post("/role-permissions", data);
  },

  getAllDataRolePermission() {
    return api.get("/role-permissions");
  },

  updatePermission(data) {
    return api.post("/permissions/update-role-permission", data);
  },

  // Lấy toàn bộ danh sách người dùng đã được phân quyền
  getAllDataUserRole() {
    return api.get("/user-roles");
  },

  // Thêm quyền cho người dùng
  addUserRole(data) {
    return api.post("/add-user-roles", data);
  },


  deleteUserRoll(id) {
    return api.delete(`/user-roles/${id}`)
  }

};

export default permissionService;
