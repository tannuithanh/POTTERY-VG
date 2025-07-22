import api from "@/plugins/axios-user";

const positionService = {

  getAll() {
    return api.get('/positions')
  },


  create(payload) {
    return api.post('/positions', payload)
  },


  update(id, payload) {
    return api.put(`/positions/${id}`, payload)
  },


  delete(id) {
    return api.delete(`/positions/${id}`)
  }
}

export default positionService