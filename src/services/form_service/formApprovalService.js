import formApi from "@/plugins/axios-form"; // Instance kết nối tới form-service

export const formApprovalService = {
  approveStep(stepId, payload) {
    return formApi.post(`/form-approval-steps/${stepId}/approve`, payload);
  },
  rejectStep(stepId, payload) {
    return formApi.post(`/form-approval-steps/${stepId}/reject`, payload);
  },

  approveVehicleDispatchStep(stepId, payload) {
    return formApi.post(`/vehicle-dispatch/${stepId}/approve`, payload);
  },

  rejectVehicleDispatchStep(stepId, payload) {
    return formApi.post(`/vehicle-dispatch/${stepId}/reject`, payload);
  },

  approveMaterialGatepass(stepId, payload = {}) {
    // payload (tuỳ trường hợp nhiều bước): { comment?, next_approver_id? }
    return formApi.post(`/material-gatepass/${stepId}/approve`, payload);
  },
  rejectMaterialGatepass(stepId, payload = {}) {
    // payload: { comment? }
    return formApi.post(`/material-gatepass/${stepId}/reject`, payload);
  },
};
