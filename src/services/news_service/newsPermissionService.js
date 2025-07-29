import newsApi from "@/plugins/axios-news";

export const newsPermissionService = {
  // 📄 Lấy toàn bộ phân quyền người dùng
  getAll() {
    return newsApi.get("/news-permissions");
  },

  // ➕ Gán hạng mục cho người dùng
  assign(user_id, news_category_ids) {
    return newsApi.post("/news-permissions", {
      user_id,
      news_category_ids,
    });
  },

  // ❌ Xoá toàn bộ quyền của một người dùng
  deleteByUser(user_id) {
    return newsApi.delete(`/news-permissions/${user_id}`);
  },
};
