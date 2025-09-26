import * as XLSX from "xlsx";
import { message } from "ant-design-vue";

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

function formatDuration(minutes) {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  let result = "";
  if (hrs > 0) result += `${hrs} giờ `;
  if (mins > 0) result += `${mins} phút`;
  return result.trim();
}

function parseTime(str) {
  if (!str) return null;
  const date = new Date(str);
  if (isNaN(date)) return null;
  return date.getHours() * 60 + date.getMinutes();
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

// NEW: map purposeType -> nhãn tiếng Việt
function getPurposeLabel(purposeType) {
  if (purposeType === "personal") return "Việc cá nhân";
  if (purposeType === "company") return "Việc công ty";
  return "";
}

export function exportFormInstanceToExcel(data) {
  if (!data || !data.length) {
    message.info("Không có dữ liệu để xuất.");
    return;
  }

  // ❗ Chỉ lấy các phiếu đã duyệt
  const filtered = data.filter((item) => item.status === "approved");

  if (!filtered.length) {
    message.info("Không có dữ liệu trạng thái ĐÃ DUYỆT để xuất.");
    return;
  }

  const exportData = filtered.map((item, index) => {
    const submitter = item.submitter_info?.name || "Không rõ";
    const msnv = item.submitter_info?.msnv || "";
    const timeStart = item.data?.fromDate;
    const timeEnd = item.data?.toDate;
    const departments = item.submitter_info?.department?.name || "";

    const startMinutes = parseTime(timeStart);
    const endMinutes = parseTime(timeEnd);

    let lateText = "";
    let earlyText = "";

    if (typeof startMinutes === "number" && typeof endMinutes === "number") {
      // Đi trễ sáng: 07:30 (450) → 09:00 (540)
      if (startMinutes >= 450 && startMinutes < 540) {
        const min = Math.min(endMinutes, 540) - Math.max(startMinutes, 450);
        if (min > 0) lateText = `✅ ${formatDuration(min)}`;
      }
      // Về sớm sáng: 09:01 (541) → 11:30 (690)
      if (startMinutes >= 541 && startMinutes < 690) {
        const min = Math.min(endMinutes, 690) - startMinutes;
        if (min > 0) earlyText = `✅ ${formatDuration(min)}`;
      }
      // Đi trễ chiều: 13:01 (781) → 15:00 (900)
      if (startMinutes >= 781 && startMinutes < 900) {
        const min = Math.min(endMinutes, 900) - startMinutes;
        if (min > 0) lateText = `✅ ${formatDuration(min)}`;
      }
      // Về sớm chiều: 15:01 (901) → 16:30 (990)
      if (startMinutes >= 901 && startMinutes < 990) {
        const min = Math.min(endMinutes, 990) - startMinutes;
        if (min > 0) earlyText = `✅ ${formatDuration(min)}`;
      }
    }

    const purposeType = item.data?.purposeType; // 'personal' | 'company'
    const lyDo = getPurposeLabel(purposeType);
    const ghiChu = item.data?.note ?? item.data?.reason ?? "";

    return {
      STT: index + 1,
      "Mã số nhân viên": msnv,
      "Tiêu đề phiếu": item.title || "",
      "Người đề nghị": submitter,
      "Bộ phận": departments,
      "Ngày tạo": formatDateTime(item.created_at),
      "Thời gian bắt đầu": formatDateTime(timeStart),
      "Thời gian kết thúc": formatDateTime(timeEnd),
      "Trạng thái": getStatusLabel(item.status),

      "Lý do": lyDo,
      "Ghi chú": ghiChu,

      "Đi trễ": lateText,
      "Số lần đi trễ": lateText ? 1 : "",
      "Về sớm": earlyText,
      "Số lần về sớm": earlyText ? 1 : "",
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();

  // Độ rộng cột tự động
  const colWidths = [];
  const keys = Object.keys(exportData[0] || {});
  keys.forEach((key) => {
    let maxLength = key.length;
    exportData.forEach((row) => {
      const val = row[key] ? String(row[key]) : "";
      if (val.length > maxLength) maxLength = val.length;
    });
    colWidths.push({ wch: maxLength + 2 });
  });
  worksheet["!cols"] = colWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, "Danh sách");
  XLSX.writeFile(workbook, "danh_sach_phieu.xlsx");
  message.success("Xuất file Excel thành công!");
}
