// utils/export-helper.js
import * as XLSX from "xlsx";
import { message } from "ant-design-vue";

/* ===== Utils chung ===== */
function formatDateTime(input) {
  if (!input) return "";
  const date = new Date(input);
  if (isNaN(date)) return "";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, "0");
  const ii = String(date.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${ii}`;
}

function parseTime(str) {
  if (!str) return null;
  const date = new Date(str);
  if (isNaN(date)) return null;
  return date.getHours() * 60 + date.getMinutes();
}

function overlapMinutes(a1, a2, b1, b2) {
  const start = Math.max(a1, b1);
  const end = Math.min(a2, b2);
  return Math.max(0, end - start);
}

/* ===== Helper: tổng phút không tính nghỉ trưa 11:30–13:00 (690–780) ===== */
function durationExcludingLunch(startStr, endStr) {
  const s = parseTime(startStr);
  const e = parseTime(endStr);
  if (typeof s !== "number" || typeof e !== "number" || e <= s) return "";
  const total = e - s;
  const lunch = overlapMinutes(s, e, 690, 780); // [11:30, 13:00)
  return total - lunch;
}

/* ===== Quy tắc đếm cho Sheet 2 theo yêu cầu mới =====
   - Nếu end > 13:00 (780) => 1 late + 1 early
   - Ngược lại: start đúng 07:30 (450) hoặc 13:00 (780) => 1 late
               còn lại => 1 early
*/
function countLateEarlyForSummary(startStr, endStr) {
  const s = parseTime(startStr);
  const e = parseTime(endStr);
  if (typeof s !== "number" || typeof e !== "number")
    return { late: 0, early: 0 };

  // ✅ Chỉ khi bắc cầu qua trưa (trước 13:00 -> sau 13:00) mới 1 trễ + 1 sớm
  if (s < 780 && e > 780) return { late: 1, early: 1 };

  // Còn lại: phân loại theo giờ bắt đầu
  if (s === 450 || s === 780) return { late: 1, early: 0 }; // 07:30 hoặc 13:00 => trễ
  return { late: 0, early: 1 }; // ngoài 2 mốc đó => sớm
}

function getStatusLabel(status) {
  return (
    {
      pending: "Đang chờ",
      approved: "Đã duyệt",
      rejected: "Từ chối",
      in_progress: "Đang xử lý",
    }[status] || status
  );
}

function getPurposeLabel(purposeType) {
  if (purposeType === "personal") return "Việc cá nhân";
  if (purposeType === "company") return "Việc công ty";
  return "";
}

/* ===== Tính đi trễ / về sớm (hiển thị ở Sheet 1) =====
   - start == 07:30 hoặc 13:00 => late ✅
   - còn lại => early ✅
*/
function computeLateEarly(startStr) {
  const m = parseTime(startStr);
  if (typeof m !== "number")
    return { lateText: "", earlyText: "", lateCount: 0, earlyCount: 0 };

  const isLate = m === 450 || m === 780;
  if (isLate) {
    return { lateText: "✅", earlyText: "", lateCount: 1, earlyCount: 0 };
  }
  return { lateText: "", earlyText: "✅", lateCount: 0, earlyCount: 1 };
}

/* ===== Viết file Excel: tự động width cột, đa sheet & đơn sheet ===== */
function autoColWidths(rows) {
  const keys = Object.keys(rows[0] || {});
  return keys.map((key) => {
    let maxLength = key.length;
    rows.forEach((row) => {
      const val = row[key] ? String(row[key]) : "";
      if (val.length > maxLength) maxLength = val.length;
    });
    return { wch: maxLength + 2 };
  });
}

function writeExcel(rows, filename, sheetName = "Danh sách") {
  if (!rows.length) {
    message.info("Không có dữ liệu để xuất.");
    return;
  }
  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = autoColWidths(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
  message.success(`Xuất file ${filename} thành công!`);
}

function writeExcelMulti(sheets = [], filename = "export.xlsx") {
  const wb = XLSX.utils.book_new();
  sheets.forEach(({ name, rows }) => {
    if (!rows || !rows.length) return;
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = autoColWidths(rows);
    XLSX.utils.book_append_sheet(wb, ws, name || "Sheet");
  });
  if (!wb.SheetNames.length) {
    return message.info("Không có dữ liệu để xuất.");
  }
  XLSX.writeFile(wb, filename);
  message.success(`Xuất file ${filename} thành công!`);
}

/* ===== 1) Giấy ra vào cổng (GateEntry) =====
   - Sheet 1: chi tiết + cột "Tổng phút (không tính 11:30–13:00)" ngay sau "Thời gian kết thúc"
   - Sheet 2: chỉ 'personal', đếm theo luật mới (end>13:00 => +2; else theo start)
*/
export function exportGateEntryToExcel(list = []) {
  const filtered = (list || []).filter(
    (item) => item?.form?.code === "GateEntry" && item.status === "approved"
  );
  if (!filtered.length) {
    return message.info(
      "Không có dữ liệu Giấy ra vào cổng (đã duyệt) để xuất."
    );
  }

  // SHEET 1: Chi tiết
  const detailRows = filtered.map((item, index) => {
    const submitter = item.submitter_info?.name || "Không rõ";
    const msnv = item.submitter_info?.msnv || "";
    const departments = item.submitter_info?.department?.name || "";
    const timeStart = item.data?.fromDate;
    const timeEnd = item.data?.toDate;

    const { lateText, earlyText, lateCount, earlyCount } =
      computeLateEarly(timeStart);
    const lyDo = getPurposeLabel(item.data?.purposeType);
    const ghiChu = item.data?.note ?? item.data?.reason ?? "";
    const totalMins = durationExcludingLunch(timeStart, timeEnd);

    return {
      STT: index + 1,
      "Mã số nhân viên": msnv,
      "Tiêu đề phiếu": item.title || "",
      "Người đề nghị": submitter,
      "Bộ phận": departments,
      "Ngày tạo": formatDateTime(item.created_at),
      "Thời gian bắt đầu": formatDateTime(timeStart),
      "Thời gian kết thúc": formatDateTime(timeEnd),
      "Tổng phút": totalMins,
      "Trạng thái": getStatusLabel(item.status),
      "Lý do": lyDo,
      "Ghi chú": ghiChu,
      "Đi trễ": lateText,
      "Số lần đi trễ": lateCount || "",
      "Về sớm": earlyText,
      "Số lần về sớm": earlyCount || "",
    };
  });

  // SHEET 2: Tổng hợp (chỉ purposeType = 'personal')
  const personalOnly = filtered.filter(
    (item) => item?.data?.purposeType === "personal"
  );

  const aggMap = new Map(); // key = msnv || (name|dept)
  personalOnly.forEach((item) => {
    const msnv = item.submitter_info?.msnv || "";
    const name = item.submitter_info?.name || "Không rõ";
    const dept = item.submitter_info?.department?.name || "";
    const start = item.data?.fromDate;
    const end = item.data?.toDate;

    const { late, early } = countLateEarlyForSummary(start, end);

    const key = msnv || `${name}|${dept}`;
    if (!aggMap.has(key)) {
      aggMap.set(key, { msnv, name, dept, late: 0, early: 0 });
    }
    const row = aggMap.get(key);
    row.late += late;
    row.early += early;
  });

  const summaryRows = Array.from(aggMap.values()).map((r, idx) => ({
    STT: idx + 1,
    "Mã số nhân viên": r.msnv,
    "Họ tên": r.name,
    "Bộ phận": r.dept,
    "Số lần đi trễ": r.late,
    "Số lần về sớm": r.early,
  }));

  writeExcelMulti(
    [
      { name: "Giấy ra vào cổng", rows: detailRows },
      { name: "Tổng hợp", rows: summaryRows },
    ],
    "GIAYRACONG.xlsx"
  );
}

/* ===== 2) Phiếu điều động xe (VehicleDispatch) – KHÔNG late/early =====
   (Giữ nguyên hành vi hiện tại, không ảnh hưởng)
*/
export function exportVehicleDispatchToExcel(list = []) {
  const filtered = (list || []).filter(
    (item) =>
      item?.form?.code === "VehicleDispatch" && item.status === "approved"
  );
  if (!filtered.length) {
    return message.info(
      "Không có dữ liệu Phiếu điều động xe (đã duyệt) để xuất."
    );
  }
  // 🔎 LOG dữ liệu gốc trước khi map
  console.log(filtered);

  const rows = filtered.map((item, index) => {
    const submitter = item.submitter_info?.name || "Không rõ";
    const msnv = item.submitter_info?.msnv || "";
    const departments = item.submitter_info?.department?.name || "";

    const start = item.data?.start_time || item.data?.fromDate;
    const end = item.data?.end_time || item.data?.toDate;

    return {
      STT: index + 1,
      "Mã số nhân viên": msnv,
      "Tiêu đề phiếu": item.title || "",
      "Người đề nghị": submitter,
      "Bộ phận": departments,
      "Ngày tạo": formatDateTime(item.created_at),
      "Xe ô tô": item.data?.vehicle || "",
      "Tài xế": item.data?.driver || "",
      "Thời gian bắt đầu": formatDateTime(item.data.start_time),
      "Thời gian kết thúc": formatDateTime(item.data.end_time),
      "Lộ trình từ": item.data?.route_from || item.data?.routeFrom || "",
      "Lộ trình đến": item.data?.route_to || item.data?.routeTo || "",
      "Lý do": item.data?.reason || "",
      "Trạng thái": getStatusLabel(item.status),
    };
  });

  writeExcel(rows, "DIEUDONGXE.xlsx", "Điều động xe");
}

/* ===== 3) Phiếu mang vật tư ra cổng (MaterialGatepass) – KHÔNG late/early =====
   (Giữ nguyên hành vi hiện tại, không ảnh hưởng)
*/
export function exportMaterialGatepassToExcel(list = []) {
  const filtered = (list || []).filter(
    (item) =>
      item?.form?.code === "MaterialGatepass" && item.status === "approved"
  );
  if (!filtered.length) {
    return message.info(
      "Không có dữ liệu Phiếu mang vật tư ra cổng (đã duyệt) để xuất."
    );
  }

  const rows = filtered.map((item, index) => {
    const submitter = item.submitter_info?.name || "Không rõ";
    const msnv = item.submitter_info?.msnv || "";
    const departments = item.submitter_info?.department?.name || "";

    const materials = Array.isArray(item.data?.materials)
      ? item.data.materials
      : Array.isArray(item.data?.items)
      ? item.data.items
      : null;

    const materialsText = materials
      ? materials
          .map(
            (m, i) =>
              `${i + 1}. ${m.name || m.item_name || ""} (${
                m.qty || m.quantity || 0
              } ${m.unit || ""})`
          )
          .join("; ")
      : item.data?.item_name || "";

    return {
      STT: index + 1,
      "Mã số nhân viên": msnv,
      "Tiêu đề phiếu": item.title || "",
      "Người đề nghị": submitter,
      "Bộ phận": departments,
      "Ngày tạo": formatDateTime(item.created_at),
      "Vật tư mang ra": materialsText,
      "Mục đích/ Lý do": item.data?.reason || item.data?.purpose || "",
      "Thời gian mang ra": item.data?.doc_date,
      "Trạng thái": getStatusLabel(item.status),
    };
  });

  writeExcel(rows, "MANGVATTURACONG.xlsx", "Mang vật tư ra cổng");
}

/* ===== 4) Dispatcher theo formCode ===== */
export function exportByFormCode(list = [], formCode = "") {
  const code = formCode || "";
  if (code === "GateEntry") return exportGateEntryToExcel(list);
  if (code === "VehicleDispatch") return exportVehicleDispatchToExcel(list);
  if (code === "MaterialGatepass") return exportMaterialGatepassToExcel(list);
  message.info("Chưa chọn loại biểu mẫu để xuất (hoặc loại không hỗ trợ).");
}

/* ===== 5) Xuất tất cả – tách file theo từng loại (nếu không chọn) ===== */
export function exportAllSeparated(list = []) {
  const any =
    (list || []).some(
      (x) => x?.form?.code === "GateEntry" && x.status === "approved"
    ) ||
    (list || []).some(
      (x) => x?.form?.code === "VehicleDispatch" && x.status === "approved"
    ) ||
    (list || []).some(
      (x) => x?.form?.code === "MaterialGatepass" && x.status === "approved"
    );

  if (!any) return message.info("Không có dữ liệu đã duyệt để xuất.");
  exportGateEntryToExcel(list);
  exportVehicleDispatchToExcel(list);
  exportMaterialGatepassToExcel(list);
}

/* ===== 6) Giữ tương thích – hàm cũ ===== */
export function exportFormInstanceToExcel(data) {
  // Alias cho GateEntry để không gãy code cũ
  return exportGateEntryToExcel(data);
}
