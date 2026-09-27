import { dataMode, site, type DataMode } from './config';
import { sampleSessions } from './sample-data';
import { isLive, isValidTimeZone, stageOf, startsAt } from './time';
import type { PublicSession, Session, SessionStatus } from './types';

export interface SessionsResult {
  sessions: Session[];
  mode: DataMode;
  /** Set when the sheet could not be reached. */
  error?: string;
}

/**
 * Reads the Sessions tab through the sheet's Apps Script web app.
 * Contract: GET {APPS_SCRIPT_URL}?action=sessions&key={APPS_SCRIPT_SECRET}
 *   → { ok: true, sessions: [{ code, title, status, date, start, end, timezone, format, city, venue, room,
 *        address, mapUrl, parking, seats, accepted, workshopLink, cohortPassword, wifiName, wifiPassword,
 *        promoCode, promoUnlocks, promoRedeem, promoExpires, surveyLink }] }
 * Cached for 60 seconds, so a new row shows up within a minute and the sheet isn't hit on every visit.
 */
export async function loadSessions(now: Date = new Date()): Promise<SessionsResult> {
  const mode = dataMode();
  if (mode === 'sample') return { sessions: sampleSessions(now), mode };
  if (mode === 'off') return { sessions: [], mode };
  try {
    const url = new URL(process.env.APPS_SCRIPT_URL as string);
    url.searchParams.set('action', 'sessions');
    url.searchParams.set('key', process.env.APPS_SCRIPT_SECRET as string);
    const res = await fetch(url, { next: { revalidate: 60, tags: ['sessions'] } });
    if (!res.ok) throw new Error(`Sheet responded ${res.status}`);
    const data = (await res.json()) as { ok?: boolean; sessions?: unknown[]; error?: string };
    if (!data?.ok || !Array.isArray(data.sessions)) throw new Error(data?.error || 'Unexpected response from the sheet');
    const sessions = data.sessions.map(normalizeSession).filter((s): s is Session => s !== null);
    return { sessions, mode };
  } catch (err) {
    console.error('[sessions] could not load from the sheet:', err);
    return { sessions: [], mode, error: 'unavailable' };
  }
}

const str = (v: unknown) => (v === null || v === undefined ? '' : String(v).trim());

/** Titles are free text in the sheet; keep them to a headline length. */
export const TITLE_MAX = 120;

function toInt(v: unknown, fallback: number): number {
  const n = Number.parseInt(str(v), 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

/** Accepts "9:00", "09:00", "9:00 AM", "1:30 pm". Returns "HH:MM" or "". */
export function toHHMM(v: unknown): string {
  const m = str(v).toLowerCase().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (!m) return '';
  let h = Number(m[1]);
  const min = Number(m[2] ?? '0');
  if (m[3] === 'pm' && h < 12) h += 12;
  if (m[3] === 'am' && h === 12) h = 0;
  if (h > 23 || min > 59) return '';
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

export function slugify(v: string): string {
  return v.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

function toStatus(v: unknown): SessionStatus {
  const s = str(v).toLowerCase();
  if (s.startsWith('draft') || s === 'hidden') return 'draft';
  if (s.startsWith('cancel')) return 'cancelled';
  if (s.startsWith('full') || s.startsWith('waitlist')) return 'full';
  if (s.startsWith('closed')) return 'closed';
  return 'open'; // blank counts as open
}

/** Turns one sheet row into a Session. Returns null for rows without a usable date and times. */
export function normalizeSession(raw: unknown): Session | null {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const date = str(r.date).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const start = toHHMM(r.start);
  const end = toHHMM(r.end);
  if (!start || !end) return null;
  const online = /online|virtual|zoom|teams|remote/i.test(str(r.format));
  const city = str(r.city) || (online ? 'Online' : '');
  const code = slugify(str(r.code)) || slugify(`${date}-${online ? 'online' : city.split(',')[0]}`);
  const tz = str(r.timezone || r.timeZone);
  return {
    code,
    // Public, like city and date. Free text from the sheet, so cap it.
    title: str(r.title).slice(0, TITLE_MAX),
    status: toStatus(r.status),
    date, start, end,
    timeZone: tz && isValidTimeZone(tz) ? tz : site.defaultTimeZone,
    format: online ? 'online' : 'in-person',
    city,
    venue: str(r.venue) || (online ? 'Zoom' : ''),
    room: str(r.room),
    address: str(r.address),
    mapUrl: str(r.mapUrl),
    parking: str(r.parking),
    seats: toInt(r.seats, 20),
    accepted: toInt(r.accepted, 0),
    workshopLink: str(r.workshopLink),
    cohortPassword: str(r.cohortPassword),
    wifiName: str(r.wifiName),
    wifiPassword: str(r.wifiPassword),
    promoCode: str(r.promoCode),
    promoUnlocks: str(r.promoUnlocks),
    promoRedeem: str(r.promoRedeem),
    promoExpires: str(r.promoExpires),
    surveyLink: str(r.surveyLink),
  };
}

export function seatInfo(s: Pick<Session, 'seats' | 'accepted' | 'status'>) {
  const left = Math.max(0, s.seats - s.accepted);
  const full = left === 0 || s.status === 'full';
  return {
    left: full ? 0 : left,
    pct: full ? 100 : Math.round((100 * Math.min(s.accepted, s.seats)) / Math.max(1, s.seats)),
    low: !full && left / Math.max(1, s.seats) <= site.lowSeatsShare,
    full,
  };
}

export function toPublic(s: Session): PublicSession {
  return {
    code: s.code, title: s.title, date: s.date, start: s.start, end: s.end, timeZone: s.timeZone, format: s.format,
    city: s.city, venue: s.venue, room: s.room, seats: s.seats, accepted: s.accepted, full: seatInfo(s).full,
  };
}

/** Workshops people can request a seat for: open or full (waitlist), not started yet, soonest first. */
export function upcomingPublic(sessions: Session[], now: Date): Session[] {
  return sessions
    .filter((s) => (s.status === 'open' || s.status === 'full') && startsAt(s).getTime() > now.getTime())
    .sort((a, b) => startsAt(a).getTime() - startsAt(b).getTime());
}

/** Groups for the /welcome front door. */
export function liveGroups(sessions: Session[], now: Date) {
  const live = sessions
    .filter((s) => s.status !== 'draft' && s.status !== 'cancelled' && isLive(s, now))
    .sort((a, b) => startsAt(a).getTime() - startsAt(b).getTime());
  return {
    today: live.filter((s) => stageOf(s, now) === 'dayof'),
    soon: live.filter((s) => stageOf(s, now) === 'before'),
    recent: live.filter((s) => stageOf(s, now) === 'after').reverse(),
    all: live,
  };
}

/** Finds a workshop by its code. Drafts stay hidden. */
export function findSession(sessions: Session[], code: string): Session | undefined {
  return sessions.find((s) => s.code === code && s.status !== 'draft');
}

/** City (or "Online · Zoom") for cards and headings. */
export function placeLabel(s: Pick<Session, 'format' | 'city' | 'venue'>): string {
  return s.format === 'online' ? `Online · ${s.venue || 'Zoom'}` : s.city;
}
