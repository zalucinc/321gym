// Reminders without a server: a recurring calendar event the phone's own
// calendar app will nag about. Works on iPhone and Android, survives reinstalls.

const DOW = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"] as const;

export function buildIcs(opts: { days: number[]; hour: number; minute: number; title: string; durationMin: number }): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}00Z`;
  // First occurrence: next matching day from today.
  const first = new Date(now);
  first.setHours(opts.hour, opts.minute, 0, 0);
  while (!opts.days.includes(first.getDay()) || first < now) first.setDate(first.getDate() + 1);
  const end = new Date(first.getTime() + opts.durationMin * 60000);
  const local = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const byday = opts.days.map((d) => DOW[d]).join(",");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//321gym//EN",
    "BEGIN:VEVENT",
    `UID:321gym-${stamp}@local`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${local(first)}`,
    `DTEND:${local(end)}`,
    `RRULE:FREQ=WEEKLY;BYDAY=${byday}`,
    `SUMMARY:${opts.title}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT15M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Gym in 15 minutes",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadIcs(content: string, filename = "gym-reminders.ics") {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
