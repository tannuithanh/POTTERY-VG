import newsApi from "@/plugins/axios-news"

export const newsCategoryService = {
  // 📥 Lấy toàn bộ danh mục (không phân quyền, dùng cho admin hoặc trang danh sách tổng)
  getAll() {
    return newsApi.get('/news-categories')
  },

  // ➕ Tạo danh mục mới
  create(data) {
    return newsApi.post('/news-categories', data)
  },

  // ✏️ Cập nhật danh mục theo ID
  update(id, data) {
    return newsApi.put(`/news-categories/${id}`, data)
  },

  // ❌ Xóa danh mục theo ID
  delete(id) {
    return newsApi.delete(`/news-categories/${id}`)
  },

  // 🔎 Lấy danh sách danh mục theo userId cụ thể (dành cho admin kiểm tra quyền của người khác)
  getByUser(userId) {
    return newsApi.get(`/news-categories/by-user/${userId}`)
  },

  // 🙋‍♂️ Lấy danh sách danh mục mà chính người dùng hiện tại (đăng nhập) được phân quyền
  getMine() {
    return newsApi.get('/news-categories/mine')
  },

}
