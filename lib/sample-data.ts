import { site } from './config';
import { addDays, todayIn } from './time';
import type { Session } from './types';

/**
 * Sample workshops for local testing and preview deployments (DATA_MODE=sample).
 * Dates are relative to today so the preview always looks populated. Never shown in production.
 */
export function sampleSessions(now: Date): Session[] {
  const tz = site.defaultTimeZone;
  const today = todayIn(tz, now);
  const make = (offset: number, city: string, room: string, start: string, end: string, seats: number, accepted: number, online = false): Session => {
    const date = addDays(today, offset);
    const slug = online ? 'online' : city.split(',')[0].toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return {
      code: `${date}-${slug}`,
      status: 'open',
      date, start, end, timeZone: tz,
      format: online ? 'online' : 'in-person',
      city: online ? 'Online' : city,
      venue: online ? 'Zoom' : 'Sample venue',
      room,
      address: online ? 'Link sent after you’re accepted' : `1 Sample St, ${city}`,
      mapUrl: '',
      parking: online ? '' : 'Free lot behind the building',
      seats, accepted,
      workshopLink: `https://workshop.example.com/${slug}`,
      cohortPassword: `${slug}-sample-2026`,
      wifiName: online ? '' : `${room.replace(/\s+/g, '')}-Guest`,
      wifiPassword: online ? '' : 'sample-wifi-2026',
      promoCode: 'SAMPLE-CODE',
      promoUnlocks: 'Sample: what the code gives you',
      promoRedeem: 'Sample: where to enter it',
      promoExpires: addDays(date, 30),
      surveyLink: 'https://example.com/survey',
    };
  };
  return [
    make(-3, 'Springfield, MA', 'Room 2', '09:00', '12:30', 20, 18),
    make(5, 'Holyoke, MA', 'Community Room', '09:00', '12:30', 20, 12),
    make(19, 'Easthampton, MA', 'Main Hall', '09:00', '12:30', 20, 16),
    make(21, 'Northampton, MA', 'Room B', '13:00', '16:30', 20, 7),
    make(39, 'Online', '', '12:00', '15:30', 24, 24, true),
  ];
}
