import AddCost from "@/pages/expense_entry/internal_costs/AddCost.vue";
import CostManager from "@/pages/expense_entry/internal_costs/CostManager.vue";

export default [
  {
    path: "/expense-entry/internal-costs/add_costs",
    name: "add_costs",
    component: AddCost,
    meta: { title: "Thêm chi phí nội bộ" },
  },
  {
    path: "/expense-entry/internal-costs/costs_manager",
    name: "add_costs_manager",
    component: CostManager,
    meta: { title: "Quản lý chi phí nội bộ" },
  },
];
