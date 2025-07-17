export function formatDateTime(input) {
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
