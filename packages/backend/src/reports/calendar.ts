// The publication calendar is configurable; database windows are UTC instants.
import { addDays, isValidDate } from "@aihot/contracts/time";
import { config } from "../config.ts";

export interface ReportSchedule {
  timeZone: string;
  dailyTime: string;
  maxItems: number;
}

export function validateReportSchedule(schedule: ReportSchedule): ReportSchedule {
  try { new Intl.DateTimeFormat("en", { timeZone: schedule.timeZone }).format(); }
  catch { throw new Error("REPORT_TIMEZONE must be a valid IANA time zone"); }
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(schedule.dailyTime)) throw new Error("REPORT_DAILY_TIME must be HH:mm");
  if (!Number.isInteger(schedule.maxItems) || schedule.maxItems < 1 || schedule.maxItems > 5) throw new Error("REPORT_DAILY_MAX_ITEMS must be between 1 and 5");
  return schedule;
}

export const REPORT_SCHEDULE = validateReportSchedule({ timeZone: config.reportTimeZone, dailyTime: config.reportDailyTime, maxItems: config.reportDailyMaxItems });

export function calendarParts(now: Date, timeZone = REPORT_SCHEDULE.timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(now);
  const part = (type: string) => parts.find((p) => p.type === type)!.value;
  return { date: `${part("year")}-${part("month")}-${part("day")}`, hour: Number(part("hour")), minute: Number(part("minute")) };
}

/** UTC instant of a publication-local wall time, accounting for the zone's offset on that date. */
export function calendarInstant(date: string, time = "00:00", timeZone = REPORT_SCHEDULE.timeZone): Date {
  if (!isValidDate(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error(`Invalid report date/time ${date} ${time}`);
  const target = Date.parse(`${date}T${time}:00Z`);
  const offsets = new Set<number>();
  // Both sides of a possible DST transition. Repeated wall times use their earlier occurrence;
  // a missing wall time advances by the transition gap, and catch-up uses the same decision.
  for (const hours of [-36, -12, 0, 12, 36]) {
    const instant = target + hours * 3600000;
    const p = calendarParts(new Date(instant), timeZone);
    offsets.add(Date.parse(`${p.date}T${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}:00Z`) - instant);
  }
  const options = [...offsets].map((offset) => {
    const instant = target - offset;
    const p = calendarParts(new Date(instant), timeZone);
    const local = Date.parse(`${p.date}T${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}:00Z`);
    return { instant, difference: local - target };
  }).filter((o) => o.difference >= 0).sort((a, b) => a.difference - b.difference || a.instant - b.instant);
  if (!options[0]) throw new Error(`Unable to resolve report date/time ${date} ${time} in ${timeZone}`);
  return new Date(options[0].instant);
}

export function dailyWindow(date: string, schedule = REPORT_SCHEDULE) {
  return { start: calendarInstant(addDays(date, -1), schedule.dailyTime, schedule.timeZone), end: calendarInstant(date, schedule.dailyTime, schedule.timeZone) };
}

export function dailyCron(schedule = REPORT_SCHEDULE): string {
  const [hour, minute] = schedule.dailyTime.split(":").map(Number);
  return `${minute} ${hour} * * *`;
}
