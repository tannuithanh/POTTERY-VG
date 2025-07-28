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
  const hasTime =
    date.getHours() !== 0 ||
    date.getMinutes() !== 0 ||
    /T\d{2}:\d{2}/.test(input);
  return hasTime ? `${dd}/${mm}/${yyyy} ${hh}:${ii}` : `${dd}/${mm}/${yyyy}`;
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
    }[status] || status
  );
}

export function exportFormInstanceToExcel(data) {
  if (!data || !data.length) {
    message.info("Không có dữ liệu để xuất.");
    return;
  }

  const userCountMap = {};

  data.forEach((item) => {
    const submitter = item.submitter_info?.name || "Không rõ";
    const timeStart = item.data?.fromDate;
    const startMinutes = parseTime(timeStart);

    let late = 0;
    let early = 0;

    if (startMinutes > 450 && startMinutes <= 540) late++;
    else if (startMinutes > 540 && startMinutes <= 690) early++;
    else if (startMinutes > 780 && startMinutes <= 900) late++;
    else if (startMinutes > 900 && startMinutes <= 990) early++;

    if (!userCountMap[submitter]) {
      userCountMap[submitter] = { late: 0, early: 0 };
    }

    userCountMap[submitter].late += late;
    userCountMap[submitter].early += early;
  });

  const exportData = data.map((item, index) => {
    const submitter = item.submitter_info?.name || "Không rõ";
    const timeStart = item.data?.fromDate;
    const timeEnd = item.data?.toDate;
    const startMinutes = parseTime(timeStart);

    let lateText = "";
    let earlyText = "";

    if (startMinutes > 450 && startMinutes <= 540)
      lateText = `✅ ${formatDuration(startMinutes - 450)}`;
    else if (startMinutes >= 541 && startMinutes <= 690)
      earlyText = `✅ ${formatDuration(690 - startMinutes)}`;
    else if (startMinutes > 780 && startMinutes <= 900)
      lateText = `✅ ${formatDuration(startMinutes - 780)}`;
    else if (startMinutes >= 901 && startMinutes <= 990)
      earlyText = `✅ ${formatDuration(990 - startMinutes)}`;

    return {
      STT: index + 1,
      "Tên biểu mẫu": item.form?.name || "",
      "Tiêu đề phiếu": item.title || "",
      "Người tạo": submitter,
      "Ngày tạo": formatDateTime(item.created_at),
      "Thời gian bắt đầu": formatDateTime(timeStart),
      "Thời gian kết thúc": formatDateTime(timeEnd),
      "Trạng thái": getStatusLabel(item.status),
      "Đi trễ": lateText,
      "Số lần đi trễ": lateText ? userCountMap[submitter]?.late || 0 : "",
      "Về sớm": earlyText,
      "Số lần về sớm": earlyText ? userCountMap[submitter]?.early || 0 : "",
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();

  const colWidths = [];
  const keys = Object.keys(exportData[0]);
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
