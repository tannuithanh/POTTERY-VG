import api from "@/plugins/axios-user";

const userService = {
  getAll() {
    return api.get("/users");
  },

  create(payload) {
    return api.post("/users", payload);
  },

  getById(id) {
    return api.get(`/users/${id}`);
  },

  update(id, payload) {
    return api.put(`/users/${id}`, payload);
  },

  delete(id) {
    return api.delete(`/users/${id}`);
  },

  assignRoles(id, roleIds) {
    return api.post(`/users/${id}/assign-role`, {
      role_ids: roleIds,
    });
  },

  getManagers() {
    return api.get('/managers')
  }
};

export default userService;
