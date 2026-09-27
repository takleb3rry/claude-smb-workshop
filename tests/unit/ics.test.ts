import { describe, expect, it } from 'vitest';
import { confirmedIcs, holdTheDateIcs } from '@/lib/ics';
import type { Session } from '@/lib/types';

const base: Session = {
  code: '2026-10-15-easthampton', title: 'Claude for Nonprofits', status: 'open',
  date: '2026-10-15', start: '09:00', end: '12:30', timeZone: 'America/New_York',
  format: 'in-person', city: 'Easthampton, MA', venue: 'Main Hall', room: 'Room 2', address: '1 Sample St',
  mapUrl: '', parking: '', seats: 20, accepted: 5, workshopLink: '', cohortPassword: '',
  wifiName: '', wifiPassword: '', promoCode: '', promoUnlocks: '', promoRedeem: '', promoExpires: '', surveyLink: '',
};

/** Undoes the 75-octet line folding so a SUMMARY can be matched in one piece. */
const unfold = (ics: string) => ics.replace(/\r\n /g, '');
const line = (ics: string, key: string) =>
  unfold(ics).split('\r\n').find((l) => l.startsWith(`${key}:`)) ?? '';

describe('hold-the-date calendar file', () => {
  it('names the workshop and marks it tentative', () => {
    const ics = holdTheDateIcs(base);
    expect(line(ics, 'SUMMARY')).toBe('SUMMARY:Claude for Nonprofits (requested) · Easthampton\\, MA');
    expect(ics).toContain('STATUS:TENTATIVE');
    expect(ics).toContain('SEQUENCE:0');
  });

  it('falls back to "Claude workshop" when the row has no title', () => {
    const ics = holdTheDateIcs({ ...base, title: '' });
    expect(line(ics, 'SUMMARY')).toBe('SUMMARY:Claude workshop (requested) · Easthampton\\, MA');
  });

  it('never leaks the welcome-page link', () => {
    expect(unfold(holdTheDateIcs(base))).not.toContain('/welcome/');
  });
});

describe('confirmed calendar file', () => {
  it('names the workshop, without "(requested)", and marks it confirmed', () => {
    const ics = confirmedIcs(base);
    expect(line(ics, 'SUMMARY')).toBe('SUMMARY:Claude for Nonprofits · Easthampton\\, MA');
    expect(ics).toContain('STATUS:CONFIRMED');
    expect(ics).toContain('SEQUENCE:1');
  });

  it('falls back to "Claude workshop" when the row has no title', () => {
    expect(line(confirmedIcs({ ...base, title: '' }), 'SUMMARY')).toBe('SUMMARY:Claude workshop · Easthampton\\, MA');
  });

  it('carries the welcome page and what to bring', () => {
    const d = line(confirmedIcs(base), 'DESCRIPTION');
    expect(d).toContain('Your welcome page has everything for the day: https://www.claudemycompany.com/welcome/2026-10-15-easthampton');
    expect(d).toContain('Bring a laptop and a charger.');
  });

  it('shares the hold-the-date UID so calendars replace the hold', () => {
    const uid = 'UID:2026-10-15-easthampton-request@claudemycompany.com';
    expect(line(holdTheDateIcs(base), 'UID')).toBe(uid);
    expect(line(confirmedIcs(base), 'UID')).toBe(uid);
  });

  it('keeps the same time and place as the hold', () => {
    for (const key of ['DTSTART', 'DTEND', 'LOCATION']) {
      expect(line(confirmedIcs(base), key)).toBe(line(holdTheDateIcs(base), key));
    }
  });
});
