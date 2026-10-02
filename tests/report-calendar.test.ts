import assert from "node:assert/strict";
import { test } from "node:test";
import { calendarInstant, calendarParts, dailyCron, dailyWindow, validateReportSchedule } from "@aihot/backend/reports/calendar";

test("the publication calendar defaults to Shanghai 08:00 and three entries", () => {
  const schedule = validateReportSchedule({ timeZone: "Asia/Shanghai", dailyTime: "08:00", maxItems: 3 });
  assert.equal(dailyCron(schedule), "0 8 * * *");
  const window = dailyWindow("2026-10-02", schedule);
  assert.equal(window.start.toISOString(), "2026-10-01T00:00:00.000Z");
  assert.equal(window.end.toISOString(), "2026-10-02T00:00:00.000Z");
});

test("a configured zone and minute cutoff produce UTC windows rather than fixed UTC+8", () => {
  const schedule = validateReportSchedule({ timeZone: "America/New_York", dailyTime: "09:35", maxItems: 5 });
  assert.equal(dailyCron(schedule), "35 9 * * *");
  assert.equal(dailyWindow("2026-10-02", schedule).end.toISOString(), "2026-10-02T13:35:00.000Z");
  assert.deepEqual(calendarParts(new Date("2026-10-02T13:34:00Z"), schedule.timeZone), { date: "2026-10-02", hour: 9, minute: 34 });
});

test("consecutive publication cutoffs cover the whole DST day, without a lost or repeated hour", () => {
  const schedule = validateReportSchedule({ timeZone: "America/New_York", dailyTime: "08:00", maxItems: 3 });
  const spring = dailyWindow("2026-03-08", schedule);
  assert.equal(spring.end.getTime() - spring.start.getTime(), 23 * 3600000);
  const autumn = dailyWindow("2026-11-01", schedule);
  assert.equal(autumn.end.getTime() - autumn.start.getTime(), 25 * 3600000);
  assert.equal(dailyWindow("2026-03-09", schedule).start.toISOString(), spring.end.toISOString());
  assert.equal(calendarInstant("2026-03-08", "02:30", schedule.timeZone).toISOString(), "2026-03-08T07:30:00.000Z");
  assert.equal(calendarInstant("2026-11-01", "01:30", schedule.timeZone).toISOString(), "2026-11-01T05:30:00.000Z");
});

test("invalid publication settings fail clearly and never permit more than five daily entries", () => {
  for (const override of [{ timeZone: "Not/AZone" }, { dailyTime: "25:00" }, { dailyTime: "8:00" }, { maxItems: 6 }, { maxItems: 0 }, { maxItems: 3.5 }]) {
    assert.throws(() => validateReportSchedule({ timeZone: "Asia/Shanghai", dailyTime: "08:00", maxItems: 3, ...override }), /REPORT_/);
  }
  assert.throws(() => calendarInstant("2026-02-30"), /Invalid report date/);
});
