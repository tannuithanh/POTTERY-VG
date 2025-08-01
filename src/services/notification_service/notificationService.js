import notificationApi from '@/plugins/axios-notification'

export default {
  // Lấy thông báo mới nhất của user hiện tại
  getAll() {
    return notificationApi.get('/notifications')
  },

  // Đánh dấu 1 thông báo đã đọc
  markAsRead(id) {
    return notificationApi.patch(`/notifications/${id}/read`)
  },

  // Tạo mới 1 thông báo (service khác gọi)
  create(data) {
    return notificationApi.post('/notifications', data)
  },
}
