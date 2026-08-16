const AR_DAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const AR_MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

export function todayId(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatDayId(dayId: string) {
  const parts = dayId.split("-").map(Number);
  const y = parts[0] ?? 1970;
  const m = parts[1] ?? 1;
  const d = parts[2] ?? 1;
  const date = new Date(y, m - 1, d);
  return `${AR_DAYS[date.getDay()]} ${d} ${AR_MONTHS[m - 1]} ${y}`;
}

export function formatTime(ts: number) {
  const d = new Date(ts);
  let h = d.getHours();
  const period = h >= 12 ? "م" : "ص";
  h = h % 12 || 12;
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${min} ${period}`;
}

export function num(n: number) {
  return new Intl.NumberFormat("ar-EG-u-nu-latn").format(n);
}
