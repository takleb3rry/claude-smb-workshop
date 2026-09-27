import { site } from './config';
import { endsAt, startsAt } from './time';
import type { Session } from './types';

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const escapeText = (v: string) => v.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');

/** Folds lines longer than 75 octets, as the calendar format requires. */
function fold(line: string): string {
  const out: string[] = [];
  let rest = line;
  while (Buffer.byteLength(rest, 'utf8') > 75) {
    let cut = 75;
    while (Buffer.byteLength(rest.slice(0, cut), 'utf8') > 75) cut--;
    out.push(rest.slice(0, cut));
    rest = ' ' + rest.slice(cut);
  }
  out.push(rest);
  return out.join('\r\n');
}

/** The workshop's name for calendar apps, for rows the sheet left untitled. */
function summaryName(s: Session): string {
  return s.title || 'Claude workshop';
}

function placeOf(s: Session): string {
  return s.format === 'online' ? 'Online' : s.city;
}

function locationOf(s: Session): string {
  return s.format === 'online' ? 'Online' : [s.venue, s.room, s.address].filter(Boolean).join(', ');
}

/**
 * Both files describe the same event and deliberately share this UID, so the confirmed one
 * updates the tentative hold already in someone's calendar instead of duplicating it.
 */
function uidOf(s: Session): string {
  return `${s.code}-request@claudemycompany.com`;
}

function wrap(vevent: string[]): string {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ClaudeMyCompany//Workshops//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...vevent,
    'END:VCALENDAR',
  ].map(fold).join('\r\n') + '\r\n';
}

/**
 * "Hold the date" file for someone who has just requested a seat. It is marked tentative and
 * deliberately leaves out the welcome-page link, which is only sent once a seat is confirmed.
 */
export function holdTheDateIcs(s: Session, now: Date = new Date()): string {
  return wrap([
    'BEGIN:VEVENT',
    `UID:${uidOf(s)}`,
    `DTSTAMP:${stamp(now)}`,
    `DTSTART:${stamp(startsAt(s))}`,
    `DTEND:${stamp(endsAt(s))}`,
    `SUMMARY:${escapeText(`${summaryName(s)} (requested) · ${placeOf(s)}`)}`,
    `DESCRIPTION:${escapeText(`Holding the date. Your seat is confirmed by email after review. Bring a laptop and charger.\n${site.url}`)}`,
    `LOCATION:${escapeText(locationOf(s))}`,
    'STATUS:TENTATIVE',
    'SEQUENCE:0',
    'TRANSP:OPAQUE',
    'END:VEVENT',
  ]);
}

/**
 * The confirmed file, linked from the accepted email as ?confirmed=1. Same UID with a higher
 * SEQUENCE so calendars replace the hold, and this one does carry the welcome-page link.
 */
export function confirmedIcs(s: Session, now: Date = new Date()): string {
  return wrap([
    'BEGIN:VEVENT',
    `UID:${uidOf(s)}`,
    `DTSTAMP:${stamp(now)}`,
    `DTSTART:${stamp(startsAt(s))}`,
    `DTEND:${stamp(endsAt(s))}`,
    `SUMMARY:${escapeText(`${summaryName(s)} · ${placeOf(s)}`)}`,
    `DESCRIPTION:${escapeText(`Your welcome page has everything for the day: ${site.url}/welcome/${s.code}\nBring a laptop and a charger.`)}`,
    `LOCATION:${escapeText(locationOf(s))}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:1',
    'TRANSP:OPAQUE',
    'END:VEVENT',
  ]);
}
