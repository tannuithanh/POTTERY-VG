import FormLayouts from "@/pages/forms/FormLayouts.vue";
import LeaveForm from "@/pages/forms/leaveForm/LeaveForm.vue";
import CheckFormCreat from "@/pages/forms/CheckFormCreat.vue";

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
    ],
  },
  {
    path: "/check_form_create",
    name: "checkFormCreate",
    component: CheckFormCreat,
    meta: { title: "Danh sách hồ sơ điện tử", moduleCode: "form" },
  },
];
