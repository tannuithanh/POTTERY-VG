import FormLayouts from "@/pages/forms/FormLayouts.vue";
import LeaveForm from "@/pages/forms/leaveForm/LeaveForm.vue";
import CheckFormCreat from "@/pages/forms/CheckFormCreat.vue";
import VehicleDispatchForm from "@/pages/forms/vehicleDispatchForm/VehicleDispatchForm.vue";
import MaterialGatepassForm from "@/pages/forms/materialGatepassForm/materialGatepassForm.vue";

export default [
  {
    path: "/forms_create",
    name: "formCreate",
    component: FormLayouts,
    meta: { title: "Tạo hồ sơ điện tử" },
    children: [
      {
        path: "leave_form",
        name: "leave_Form",
        component: LeaveForm,
        meta: {
          title: "Biểu mẫu giấy ra vào cổng",
          moduleCode: "form",
        },
      },
      {
        path: "vehicle_dispatch_form",
        name: "vehicle_dispatch_form",
        component: VehicleDispatchForm,
        meta: {
          title: "Biểu mẫu phiếu điều động xe",
          moduleCode: "form",
        },
      },
      {
        path: 'material_gatepass_form',
        name: 'MaterialGatepassForm',
        component: MaterialGatepassForm,
        meta: {
          title: "Biểu mẫu phiếu mang vật tư ra cổng",
          moduleCode: "form",
        },
      }
    ],
  },
  {
    path: "/check_form_create",
    name: "checkFormCreate",
    component: CheckFormCreat,
    meta: { title: "Danh sách hồ sơ điện tử", moduleCode: "form" },
  },
];
