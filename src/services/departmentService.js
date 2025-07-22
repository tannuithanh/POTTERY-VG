import api from '@/plugins/axios-user'

const departmentService = {

  getAll() {
    return api.get('/departments')
  },

  create(payload) {
    return api.post('/departments', payload)
  },


  update(id, payload) {
    return api.put(`/departments/${id}`, payload)
  },


  delete(id) {
    return api.delete(`/departments/${id}`)
  }
}

export default departmentService
