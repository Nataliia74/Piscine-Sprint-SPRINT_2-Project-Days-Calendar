// generate-ical.mjs

import fs from "node:fs/promises";
import crypto from "node:crypto";
import daysData from "./days.json" with { type: "json" };
import {
  getMonthIndex,
  getWeekDayIndex,
  getOccurrenceWeekdayInMonth,
} from "./common.mjs";

// -------- Config
const START_YEAR = 2020;
const END_YEAR   = 2030;
const LOCALE     = "en-GB"; // pin for deterministic month/weekday names

// -------- Helpers (RFC5545-friendly)
const CRLF = "\r\n";

const pad2 = (n) => String(n).padStart(2, "0");
const ymd  = (y, m, d) => `${y}${pad2(m + 1)}${pad2(d)}`; // VALUE=DATE form

function dtStampUTC() {
  // YYYYMMDDTHHMMSSZ
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function escapeICS(text = "") {
  // Escape per RFC5545: backslash, comma, semicolon, newline
  return String(text)
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

// Fold long lines to <= 75 octets (we'll be conservative at ~72 chars)
function foldLine(line, width = 72) {
  const out = [];
  // We’ll fold by JS chars (safe enough for ASCII / simple text); for full
  // octet-precision you’d chunk by bytes, but this works well for our content.
  for (let i = 0; i < line.length; i += width) {
    out.push(line.slice(i, i + width));
  }
  return out.join(CRLF + " ");
}

// Format a property line with folding
function prop(name, value) {
  return foldLine(`${name}:${value}`);
}

function uidFor(name, dateStr) {
  const hash = crypto.createHash("sha1").update(`${name}|${dateStr}`).digest("hex");
  return `${hash}@dayscalendar.local`;
}

async function safeFetchText(url, fallback) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(res.statusText);
    return (await res.text()).trim();
  } catch {
    // Keep file importable even offline
    return fallback;
  }
}

const OCC = { first: 1, second: 2, third: 3, fourth: 4, last: -1 };

// -------- Build VEVENT blocks
async function buildEvents() {
  const events = [];

  for (const d of daysData) {
    const monthIdx   = getMonthIndex(d.monthName, LOCALE);
    const weekdayIdx = getWeekDayIndex(d.dayName, LOCALE);
    const occ        = OCC[d.occurence?.toLowerCase()];

    for (let y = START_YEAR; y <= END_YEAR; y++) {
      const dayNum = getOccurrenceWeekdayInMonth(y, monthIdx, weekdayIdx, occ);
      if (!dayNum) continue;

      const start = ymd(y, monthIdx, dayNum);
      const end   = ymd(y, monthIdx, dayNum + 1); // all-day DTEND is next day
      const uid   = uidFor(d.name, start);

      const descRaw = await safeFetchText(d.descriptionURL, d.name);
      const desc    = escapeICS(descRaw);

      const lines = [
        "BEGIN:VEVENT",
        prop("UID", uid),
        prop("DTSTAMP", dtStampUTC()),
        prop("SUMMARY", escapeICS(d.name)),
        prop("DTSTART;VALUE=DATE", start),
        prop("DTEND;VALUE=DATE", end),
        prop("DESCRIPTION", desc),
        "END:VEVENT",
      ];

      events.push(lines.join(CRLF));
    }
  }
  return events;
}

// -------- Main
async function main() {
  const header = [
    "BEGIN:VCALENDAR",
    "PRODID:-//Days Calendar//CYF//EN",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    // Optional display name (uncomment if you like):
    // prop("X-WR-CALNAME", "Commemorative Days"),
  ].join(CRLF);

  const events = await buildEvents();
  const ics = header + CRLF + events.join(CRLF) + CRLF + "END:VCALENDAR" + CRLF;

  await fs.writeFile("days.ics", ics, "utf8");
  console.log(`Wrote days.ics with ${events.length} events (${START_YEAR}–${END_YEAR}).`);
}

main().catch((err) => {
  console.error("Failed to build days.ics:", err);
  process.exit(1);
});
