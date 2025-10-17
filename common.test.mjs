import assert from "node:assert/strict";
import test from "node:test";
import { getMonthIndex } from "./common.mjs";
import { getWeekDayIndex } from "./common.mjs";
import { getCommemorativeDayOfMonth } from "./common.mjs";
import { getOccurrenceWeekdayInMonth } from "./common.mjs";




test("getMonthIndex should return 9 for October", () => {
  assert.strictEqual(getMonthIndex("October", "en-GB"), 9);
});

test("getMonthIndex should return 0 for January", () => {
  assert.strictEqual(getMonthIndex("JANUARY", "en-GB"), 0);
});

test("getMonthIndex should return 'There is no such month' for For", () => {
  assert.throws(() => (getMonthIndex("For", "en-GB"), "There is no such month"));
});

test("getWeekDayIndex should return 0 for Sunday", () => {
  assert.strictEqual(getWeekDayIndex("Sunday", "en-GB"), 0);
});

test("getWeekDayIndex should return 2 for Tuesday", () => {
  assert.strictEqual(getWeekDayIndex("Tuesday", "en-GB"), 2);
});

test("getWeekDayIndex should return 2 for Tuesday", () => {
  assert.strictEqual(getWeekDayIndex("TUESDAY", "en-GB"), 2);
});

test("getWeekDayIndex should return 'There is no such weekday' for GG", () => {
  assert.throws(
    () => (getWeekDayIndex("GG", "en-GB"), "There is no such weekday")
  );
});

test("getOccurrenceWeekdayInMonth should return 7th of October, 2025, 1st Tuesday", () => {
  assert.strictEqual(getOccurrenceWeekdayInMonth(2025, 9, 2, 1), 7);
});

test("getOccurrenceWeekdayInMonth should return 11th of May, 2024, 2nd Saturday", () => {
  assert.strictEqual(getOccurrenceWeekdayInMonth(2024, 4, 6, 2), 11);
});

test("getOccurrenceWeekdayInMonth should return 'Invalid occurrence'", () => {
  assert.throws(
    () => (getOccurrenceWeekdayInMonth(2024, 11, 6, 0), "Invalid occurrence")
  );
});

test("getOccurrenceWeekdayInMonth should return 'null'", () => {
  assert.throws(
    () => (getOccurrenceWeekdayInMonth(2024, 11, 6, -2), "Invalid occurrence")
  );
});

test("getOccurrenceWeekdayInMonth should return 'null'", () => {
  assert.strictEqual(getOccurrenceWeekdayInMonth(2024, 11, 6, 5), null);
});

test("getCommemorativeDayOfMonth should return 'International Binturong Day' 11.05.2024", () => {
  assert.deepStrictEqual(getCommemorativeDayOfMonth(2024, 4, "en-GB"), [
    {
      name: "International Binturong Day",
      date: 11,
      descriptionURL: "https://codeyourfuture.github.io/The-Piscine/days/binturongs.txt"
    },
  ]);
});

test("getCommemorativeDayOfMonth should return several commemorative days if month has several", () => {
  assert.deepStrictEqual(getCommemorativeDayOfMonth(2024, 8, "en-GB"), [
    {
      name: "International Vulture Awareness Day",
      date: 7,
      descriptionURL:"https://codeyourfuture.github.io/The-Piscine/days/vultures.txt"
    },
    {
      name: "International Red Panda Day",
      date: 21,
      descriptionURL: "https://codeyourfuture.github.io/The-Piscine/days/red-pandas.txt"
    },
  ]);
});

test("getCommemorativeDayOfMonth should return an empty array if month hasn't any commentative months", () => {
  assert.deepStrictEqual(getCommemorativeDayOfMonth(2024, 0, "en"), []);
});

test("getCommemorativeDayOfMonth should skip invalid month entries", () => {
  assert.deepStrictEqual(getCommemorativeDayOfMonth(2024, 12, "en"), []);
});
