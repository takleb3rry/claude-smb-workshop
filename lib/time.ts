import { site } from './config';
import type { Session, Stage } from './types';

const DAY_MS = 86_400_000;
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DOW_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MON_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function ymd(date: string): [number, number, number] {
  const [y, m, d] = date.split('-').map(Number);
  return [y, m, d];
}

/** Milliseconds the given time zone is ahead of UTC at that instant. */
function tzOffsetMs(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(instant);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
  return asUtc - Math.floor(instant.getTime() / 1000) * 1000;
}

/** Wall-clock date + time in a time zone → the real instant. Handles daylight-saving changes. */
export function zonedTimeToUtc(date: string, time: string, timeZone: string): Date {
  const [y, m, d] = ymd(date);
  const [hh, mm] = time.split(':').map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  const first = tzOffsetMs(new Date(guess), timeZone);
  let utc = guess - first;
  const second = tzOffsetMs(new Date(utc), timeZone);
  if (second !== first) utc = guess - second;
  return new Date(utc);
}

/** Today's date (YYYY-MM-DD) in a time zone. */
export function todayIn(timeZone: string, now: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

/** Whole calendar days from a to b (both YYYY-MM-DD). */
export function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = ymd(a);
  const [by, bm, bd] = ymd(b);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / DAY_MS);
}

export function addDays(date: string, days: number): string {
  const [y, m, d] = ymd(date);
  const x = new Date(Date.UTC(y, m - 1, d + days));
  return x.toISOString().slice(0, 10);
}

export function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = (((h * 60 + m + minutes) % 1440) + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function weekday(date: string): number {
  const [y, m, d] = ymd(date);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** "Thu, Oct 15" */
export function fDay(date: string): string {
  const [, m, d] = ymd(date);
  return `${DOW[weekday(date)]}, ${MON[m - 1]} ${d}`;
}

/** "Thursday, October 15, 2026" */
export function fLong(date: string): string {
  const [y, m, d] = ymd(date);
  return `${DOW_LONG[weekday(date)]}, ${MON_LONG[m - 1]} ${d}, ${y}`;
}

export function dowShort(date: string): string {
  return DOW[weekday(date)].toUpperCase();
}

export function monthDay(date: string): string {
  const [, m, d] = ymd(date);
  return `${MON[m - 1].toUpperCase()} ${d}`;
}

export function weekdayLong(date: string): string {
  return DOW_LONG[weekday(date)];
}

/** "9:00 am" */
export function fTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ap = h >= 12 ? 'pm' : 'am';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ap}`;
}

/** Short zone label for online sessions, e.g. "ET". */
export function zoneLabel(timeZone: string, date: string): string {
  try {
    const at = zonedTimeToUtc(date, '12:00', timeZone);
    const name = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'short' })
      .formatToParts(at).find((p) => p.type === 'timeZoneName')?.value ?? '';
    return /^E[DS]T$/.test(name) ? 'ET' : /^C[DS]T$/.test(name) ? 'CT' : /^M[DS]T$/.test(name) ? 'MT' : /^P[DS]T$/.test(name) ? 'PT' : name;
  } catch {
    return '';
  }
}

export function startsAt(s: Session): Date {
  return zonedTimeToUtc(s.date, s.start, s.timeZone);
}

export function endsAt(s: Session): Date {
  return zonedTimeToUtc(s.date, s.end, s.timeZone);
}

/** Resources stay open until the end of the two-week window. */
export function windowEndsAt(s: Session): Date {
  return new Date(endsAt(s).getTime() + site.windowDays * DAY_MS);
}

/**
 * Before → Day of (from doors open, an hour before start) → After (two-week window) → Ended.
 */
export function stageOf(s: Session, now: Date): Stage {
  const doors = startsAt(s).getTime() - site.doorsOpenMinutes * 60_000;
  const t = now.getTime();
  if (t < doors) return 'before';
  if (t <= endsAt(s).getTime()) return 'dayof';
  if (t <= windowEndsAt(s).getTime()) return 'after';
  return 'ended';
}

/** A workshop appears on /welcome from two weeks before it starts until its window closes. */
export function isLive(s: Session, now: Date): boolean {
  const opens = startsAt(s).getTime() - site.windowDays * DAY_MS;
  return now.getTime() >= opens && now.getTime() <= windowEndsAt(s).getTime();
}

/** Whole days left in the two-week window (rounded up). */
export function daysLeftInWindow(s: Session, now: Date): number {
  return Math.max(0, Math.ceil((windowEndsAt(s).getTime() - now.getTime()) / DAY_MS));
}

/** "Thu, Oct 29" for the day the window closes, in the session's time zone. */
export function windowEndDay(s: Session): string {
  return fDay(todayIn(s.timeZone, windowEndsAt(s)));
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
    return true;
  } catch {
    return false;
  }
}
