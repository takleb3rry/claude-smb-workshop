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

/**
 * "Hold the date" file for someone who has just requested a seat. It is marked tentative and
 * deliberately leaves out the welcome-page link, which is only sent once a seat is confirmed.
 */
export function holdTheDateIcs(s: Session, now: Date = new Date()): string {
  const where = s.format === 'online' ? 'Online' : [s.venue, s.room, s.address].filter(Boolean).join(', ');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ClaudeMyCompany//Workshops//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${s.code}-request@claudemycompany.com`,
    `DTSTAMP:${stamp(now)}`,
    `DTSTART:${stamp(startsAt(s))}`,
    `DTEND:${stamp(endsAt(s))}`,
    `SUMMARY:${escapeText(`Claude workshop (requested) · ${s.format === 'online' ? 'Online' : s.city}`)}`,
    `DESCRIPTION:${escapeText(`Holding the date. Your seat is confirmed by email after review. Bring a laptop and charger.\n${site.url}`)}`,
    `LOCATION:${escapeText(where)}`,
    'STATUS:TENTATIVE',
    'TRANSP:OPAQUE',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.map(fold).join('\r\n') + '\r\n';
}
