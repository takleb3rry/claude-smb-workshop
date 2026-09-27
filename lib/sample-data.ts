import { site } from './config';
import { addDays, todayIn } from './time';
import type { Session, SessionStatus } from './types';

/**
 * Sample workshops for local testing and preview deployments (DATA_MODE=sample).
 * Dates are relative to today so the preview always looks populated. Never shown in production.
 * Every sample workshop is in person. One is deliberately left untitled, so the no-title
 * layout gets exercised too, and one is full so the waitlist state shows up.
 */
export function sampleSessions(now: Date): Session[] {
  const tz = site.defaultTimeZone;
  const today = todayIn(tz, now);
  const make = (
    offset: number,
    title: string,
    city: string,
    room: string,
    start: string,
    end: string,
    seats: number,
    accepted: number,
    status: SessionStatus = 'open',
  ): Session => {
    const date = addDays(today, offset);
    const slug = city.split(',')[0].toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return {
      code: `${date}-${slug}`,
      title,
      status,
      date, start, end, timeZone: tz,
      format: 'in-person',
      city,
      venue: 'Sample venue',
      room,
      address: `1 Sample St, ${city}`,
      mapUrl: '',
      parking: 'Free lot behind the building',
      seats, accepted,
      workshopLink: `https://workshop.example.com/${slug}`,
      cohortPassword: `${slug}-sample-2026`,
      wifiName: `${room.replace(/\s+/g, '')}-Guest`,
      wifiPassword: 'sample-wifi-2026',
      promoCode: 'SAMPLE-CODE',
      promoUnlocks: 'Sample: what the code gives you',
      promoRedeem: 'Sample: where to enter it',
      promoExpires: addDays(date, 30),
      surveyLink: 'https://example.com/survey',
    };
  };
  return [
    make(-3, 'Claude for the Trades', 'Springfield, MA', 'Room 2', '09:00', '12:30', 20, 18),
    make(5, 'Claude for Nonprofits', 'Holyoke, MA', 'Community Room', '09:00', '12:30', 20, 12),
    make(19, '', 'Easthampton, MA', 'Main Hall', '09:00', '12:30', 20, 16), // untitled on purpose
    make(21, 'Claude for Retail', 'Northampton, MA', 'Room B', '13:00', '16:30', 20, 7),
    make(39, 'Claude for Manufacturing', 'Pittsfield, MA', 'Room 1', '12:00', '15:30', 24, 24, 'full'),
  ];
}
