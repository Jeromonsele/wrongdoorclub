// src/utils/ics.ts
export function buildICS(opts: {
  title: string;
  startISO: string;        // ISO with timezone
  durationMin?: number;    // default 120
  description?: string;
  location?: string;
}): string {
  const { title, startISO, durationMin = 120, description = "", location = "" } = opts;
  const start = new Date(startISO);
  const end = new Date(start.getTime() + durationMin * 60000);

  const toICS = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wrong Door Club//EN",
    "BEGIN:VEVENT",
    `UID:${cryptoRandom()}`,
    `DTSTAMP:${toICS(new Date())}`,
    `DTSTART:${toICS(start)}`,
    `DTEND:${toICS(end)}`,
    `SUMMARY:${escapeICS(title)}`,
    `DESCRIPTION:${escapeICS(description)}`,
    `LOCATION:${escapeICS(location)}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ];
  return lines.join("\r\n");
}

function cryptoRandom() {
  try {
    return String(crypto.getRandomValues(new Uint32Array(2))[0]);
  } catch {
    return String(Math.random()).slice(2);
  }
}

function escapeICS(s: string) {
  return s.replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");
}


