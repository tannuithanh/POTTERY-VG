import api from '@/plugins/axios-user'

const moduleService = {

  getAll() {
    return api.get('/modules')
  },

  create(payload) {
    return api.post('/modules', payload)
  },

  update(id, payload) {
    return api.put(`/modules/${id}`, payload)
  },

  delete(id) {
    return api.delete(`/modules/${id}`)
  }

}

export default moduleService
