import api from '@/plugins/axios-user'

const roleService = {
  // Lấy tất cả vai trò (có thể có tìm kiếm)
  getAll(params = {}) {
    return api.get('/roles', { params })
  },

  // Tạo mới vai trò
  create(data) {
    // data = { name: '', code: '' }
    return api.post('/roles', data)
  },

  // Cập nhật vai trò
  update(id, data) {
    return api.put(`/roles/${id}`, data)
  },

  // Xoá vai trò
  delete(id) {
    return api.delete(`/roles/${id}`)
  }
}

export default roleService
