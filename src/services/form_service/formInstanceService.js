import formApi from "@/plugins/axios-form"; // instance kết nối form-service

export const formInstanceService = {
  // --- Gate Pass (đang có) ---
  createGatePass(data) {
    return formApi.post("/form-instances/gate-pass", data);
  },
  getAll() {
    return formApi.get("/form-instances");
  },
  deleteFormInstance(id) {
    return formApi.delete(`/form-instances/${id}`);
  },
  getById(id) {
    return formApi.get(`/form-instances/${id}`);
  },
  getGatePassStats(month) {
    return formApi.get("/gate-pass-statistics", {
      params: month ? { month } : {},
    });
  },

  // --- Vehicle Dispatch (Điều động xe) ---
  createVehicleDispatch(data) {
    return formApi.post("/vehicle-dispatch", data);
  },


};
