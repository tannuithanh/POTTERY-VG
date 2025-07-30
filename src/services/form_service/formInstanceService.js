import formApi from '@/plugins/axios-form' // instance kết nối form-service

export const formInstanceService = {
  createGatePass(data) {
    return formApi.post('/form-instances/gate-pass', data)
  },
  getAll() {
    return formApi.get('/form-instances')
  },

  deleteFormInstance(id) {
    return formApi.delete(`/form-instances/${id}`)
  },

    // 📊 Call API lấy số lượng phiếu theo phòng ban
  getGatePassStats(month) {
    return formApi.get('/gate-pass-statistics', {
      params: month ? { month } : {}
    })
  }
}
