import meetingScheduleApi from "@/plugins/axios-meeting-schedule";

const roomService = {
  // Danh sách tất cả phòng họp
  getAll: () => {
    return meetingScheduleApi.get("/rooms");
  },

  // Lấy 1 phòng họp theo ID
  getById: (id) => {
    return meetingScheduleApi.get(`/rooms/${id}`);
  },

  // Tạo mới phòng họp
  create: (data) => {
    // data: { name: "Phòng họp ABC" }
    return meetingScheduleApi.post("/rooms", data);
  },

  // Cập nhật phòng họp
  update: (id, data) => {
    // data: { name: "Tên mới" }
    return meetingScheduleApi.put(`/rooms/${id}`, data);
  },

  // Xoá phòng họp
  remove: (id) => {
    return meetingScheduleApi.delete(`/rooms/${id}`);
  },
};

export default roomService;
