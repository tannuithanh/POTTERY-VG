import newsApi from "@/plugins/axios-news";

export const newsService = {
  // ➕ Tạo mới một bài viết (news) – dùng khi gửi form tạo bảng tin
  create(formData) {
    return newsApi.post("/news", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // 📥 Lấy danh sách tất cả bài viết (dành cho admin hoặc người có quyền)
  getAll(params = {}) {
    return newsApi.get("/news", { params });
  },

  // 🔍 Lấy chi tiết bài viết theo ID
  getById(id) {
    return newsApi.get(`/news/${id}`);
  },

  // ✏️ Cập nhật bài viết theo ID
  update(id, formData) {
    return newsApi.post(`/news/${id}?_method=PUT`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // ❌ Xóa bài viết theo ID
  delete(id) {
    return newsApi.delete(`/news/${id}`);
  },

  // 📚 Lấy tất cả hạng mục kèm theo 5 bảng tin mới nhất
  groupByCategory() {
    return newsApi.get("/news/group-by-category");
  },

  // 🆕 Lấy 5 bài viết mới nhất (không phân quyền)
  latest() {
    return newsApi.get("/news/latest");
  },
};
