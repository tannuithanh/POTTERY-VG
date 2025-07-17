import api from '@/plugins/axios'

const actionService = {
  // Lấy danh sách tất cả hành động (action)
  getAll() {
    return api.get('/actions')
  }
}

export default actionService
