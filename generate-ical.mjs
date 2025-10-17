
import fs from "node:fs/promises";
import daysData from "./days.json" with { type: "json" };
import {
  getMonthIndex,
  getWeekDayIndex,
  getOccurrenceWeekdayInMonth,
} from "./common.mjs";

const START_YEAR = 2020;
const END_YEAR   = 2030;
const LOCALE     = "en-GB"; 

const CRLF = "\r\n";

function pad2(n) { return String(n).padStart(2, "0"); }

function dateYMD(y, m0, d) {
  return `${y}${pad2(m0 + 1)}${pad2(d)}`;
}

function utcStamp() {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function escapeICS(text = "") {
  return String(text)
    .replace(/\\/g, "\\\\") 
    .replace(/\n/g, "\\n")  
    .replace(/;/g, "\\;")   
    .replace(/,/g, "\\,");  
}


function makeUID(name, ymd) {
  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  return `${slug}-${ymd}@dayscalendar`;
}


async function getDescription(url, name) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("bad status");
    return (await res.text()).trim();
  } catch {
    return name; 
  }
}


const OCC = { first: 1, second: 2, third: 3, fourth: 4, last: -1 };


async function buildEvents() {
  const events = [];

  for (const d of daysData) {
    const monthIndex   = getMonthIndex(d.monthName, LOCALE);
    const weekdayIndex = getWeekDayIndex(d.dayName, LOCALE);
    const occurrence   = OCC[d.occurence?.toLowerCase()];

    for (let year = START_YEAR; year <= END_YEAR; year++) {
      const dayNum = getOccurrenceWeekdayInMonth(year, monthIndex, weekdayIndex, occurrence);
      if (!dayNum) continue; 

      const start = dateYMD(year, monthIndex, dayNum);
      const end   = dateYMD(year, monthIndex, dayNum + 1); 
      const uid   = makeUID(d.name, start);

      const rawDesc = await getDescription(d.descriptionURL, d.name);
      const desc    = escapeICS(rawDesc);

      const vevent =
        "BEGIN:VEVENT" + CRLF +
        `UID:${uid}` + CRLF +
        `DTSTAMP:${utcStamp()}` + CRLF +
        `SUMMARY:${escapeICS(d.name)}` + CRLF +
        `DTSTART;VALUE=DATE:${start}` + CRLF +
        `DTEND;VALUE=DATE:${end}` + CRLF +
        `DESCRIPTION:${desc}` + CRLF +
        "END:VEVENT";

      events.push(vevent);
    }
  }

  return events;
}


async function main() {
  const header =
    "BEGIN:VCALENDAR" + CRLF +
    "PRODID:-//Days Calendar//CYF//EN" + CRLF +
    "VERSION:2.0" + CRLF +
    "CALSCALE:GREGORIAN" + CRLF +
    "METHOD:PUBLISH";

  const events = await buildEvents();

  const ics = header + CRLF + events.join(CRLF) + CRLF + "END:VCALENDAR" + CRLF;

  await fs.writeFile("days.ics", ics, "utf8");
  console.log(`Wrote days.ics with ${events.length} events (${START_YEAR}–${END_YEAR}).`);
}

main().catch(err => {
  console.error("Failed to build days.ics:", err);
  process.exit(1);
});
