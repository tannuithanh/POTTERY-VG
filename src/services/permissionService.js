import api from '@/plugins/axios'

const permissionService = {
  // Lấy tất cả danh sách permission
  getAll() {
    return api.get('/permissions')
  },

  // Tạo mới permission theo module + action
  create(data) {
    return api.post('/permissions', data)
  }
}

export default permissionService
