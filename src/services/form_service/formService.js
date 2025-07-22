import formApi from "@/plugins/axios-form";

export const formService = {
  // 📝 Tạo biểu mẫu
  create(data) {
    return formApi.post("/forms", data);
  },

  // 📋 Lấy danh sách biểu mẫu
  getAll() {
    return formApi.get("/forms");
  },

  // 📄 Xem chi tiết biểu mẫu
  getById(id) {
    return formApi.get(`/forms/${id}`);
  },

  // ✏️ Cập nhật biểu mẫu
  update(id, data) {
    return formApi.put(`/forms/${id}`, data);
  },

  // ❌ Xóa biểu mẫu
  delete(id) {
    return formApi.delete(`/forms/${id}`);
  },
};
