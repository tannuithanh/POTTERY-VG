import formApi from '@/plugins/axios-form' // Instance kết nối tới form-service

export const formApprovalService = {
  approveStep(stepId, payload) {
    return formApi.post(`/form-approval-steps/${stepId}/approve`, payload)
  },
  rejectStep(stepId, payload) {
    return formApi.post(`/form-approval-steps/${stepId}/reject`, payload)
  }
}
