// src/services/meeting_schedule_service/meetingService.js
import meetingScheduleApi from "@/plugins/axios-meeting-schedule";

const meetingRoomService = {
  // Lấy danh sách cuộc họp
  async list(filters = {}) {
    try {
      const query = new URLSearchParams({
        per_page: 10,
        include_users: true,
        ...filters,
      }).toString();

      const { data } = await meetingScheduleApi.get(`/meetings?${query}`);
      return data;
    } catch (err) {
      throw normalizeAxiosError(err);
    }
  },

  // Lấy chi tiết cuộc họp
  async get(id, options = { include_users: true }) {
    try {
      const query = new URLSearchParams(options).toString();
      const { data } = await meetingScheduleApi.get(`/meetings/${id}?${query}`);
      return data;
    } catch (err) {
      throw normalizeAxiosError(err);
    }
  },

  // Tạo mới cuộc họp
  async create(payload) {
    try {
      const { data } = await meetingScheduleApi.post("/meetings", payload);
      return data;
    } catch (err) {
      throw normalizeAxiosError(err);
    }
  },

  // Cập nhật cuộc họp
  async update(id, payload) {
    try {
      const { data } = await meetingScheduleApi.patch(
        `/meetings/${id}`,
        payload
      );
      return data;
    } catch (err) {
      throw normalizeAxiosError(err);
    }
  },

  // Xoá cuộc họp
  async destroy(id) {
    try {
      const { data } = await meetingScheduleApi.delete(`/meetings/${id}`);
      return data;
    } catch (err) {
      throw normalizeAxiosError(err);
    }
  },

  // Upload 1 file cho cuộc họp (✅ /file số ít)
  async uploadFile(id, file) {
    try {
      const form = new FormData();
      form.append("file", file); // hoặc file.originFileObj nếu dùng a-upload

      const { data } = await meetingScheduleApi.post(
        `/meetings/${id}/file`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return data; // { file, file_url }
    } catch (err) {
      throw normalizeAxiosError(err);
    }
  },
};

// Xử lý lỗi
function normalizeAxiosError(err) {
  if (err?.response?.data) return err.response.data;
  if (err?.message) return new Error(err.message);
  return new Error("Network error");
}

export default meetingRoomService;
