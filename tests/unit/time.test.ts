import { describe, expect, it } from 'vitest';
import { addDays, addMinutes, daysBetween, fDay, fLong, fTime, isLive, stageOf, todayIn, zonedTimeToUtc, zoneLabel } from '@/lib/time';
import type { Session } from '@/lib/types';

const base: Session = {
  code: 'x', status: 'open', date: '2026-10-15', start: '09:00', end: '12:30', timeZone: 'America/New_York',
  format: 'in-person', city: 'Easthampton, MA', venue: 'V', room: 'R', address: '', mapUrl: '', parking: '',
  seats: 20, accepted: 5, workshopLink: '', cohortPassword: '', wifiName: '', wifiPassword: '',
  promoCode: '', promoUnlocks: '', promoRedeem: '', promoExpires: '', surveyLink: '',
};

describe('time zones', () => {
  it('converts New York wall time to UTC in daylight time', () => {
    expect(zonedTimeToUtc('2026-10-15', '09:00', 'America/New_York').toISOString()).toBe('2026-10-15T13:00:00.000Z');
  });
  it('converts New York wall time to UTC in standard time', () => {
    expect(zonedTimeToUtc('2026-11-04', '12:00', 'America/New_York').toISOString()).toBe('2026-11-04T17:00:00.000Z');
  });
  it('handles the day clocks change', () => {
    expect(zonedTimeToUtc('2026-11-01', '09:00', 'America/New_York').toISOString()).toBe('2026-11-01T14:00:00.000Z');
    expect(zonedTimeToUtc('2026-03-08', '09:00', 'America/New_York').toISOString()).toBe('2026-03-08T13:00:00.000Z');
  });
  it('works for other zones', () => {
    expect(zonedTimeToUtc('2026-10-15', '09:00', 'America/Chicago').toISOString()).toBe('2026-10-15T14:00:00.000Z');
  });
  it('knows today in a zone', () => {
    expect(todayIn('America/New_York', new Date('2026-10-16T02:00:00Z'))).toBe('2026-10-15');
  });
  it('labels online zones', () => {
    expect(zoneLabel('America/New_York', '2026-11-04')).toBe('ET');
  });
});

describe('formatting', () => {
  it('formats dates and times', () => {
    expect(fDay('2026-10-15')).toBe('Thu, Oct 15');
    expect(fLong('2026-10-15')).toBe('Thursday, October 15, 2026');
    expect(fTime('09:00')).toBe('9:00 am');
    expect(fTime('13:30')).toBe('1:30 pm');
    expect(fTime('00:15')).toBe('12:15 am');
    expect(fTime('12:00')).toBe('12:00 pm');
  });
  it('does date and time arithmetic', () => {
    expect(addMinutes('09:00', -60)).toBe('08:00');
    expect(addMinutes('12:30', -50)).toBe('11:40');
    expect(addDays('2026-10-30', 3)).toBe('2026-11-02');
    expect(daysBetween('2026-10-15', '2026-10-17')).toBe(2);
    expect(daysBetween('2026-10-17', '2026-10-15')).toBe(-2);
  });
});

describe('welcome page stages', () => {
  const at = (iso: string) => new Date(iso);
  it('is "before" until doors open an hour before start', () => {
    expect(stageOf(base, at('2026-10-15T11:59:00Z'))).toBe('before');
  });
  it('is "day of" from doors open through the end', () => {
    expect(stageOf(base, at('2026-10-15T12:00:00Z'))).toBe('dayof');
    expect(stageOf(base, at('2026-10-15T16:30:00Z'))).toBe('dayof');
  });
  it('is "after" for the two-week window, then "ended"', () => {
    expect(stageOf(base, at('2026-10-15T16:31:00Z'))).toBe('after');
    expect(stageOf(base, at('2026-10-29T16:30:00Z'))).toBe('after');
    expect(stageOf(base, at('2026-10-29T16:31:00Z'))).toBe('ended');
  });
  it('shows on the front door from two weeks before until the window closes', () => {
    expect(isLive(base, at('2026-09-30T12:59:00Z'))).toBe(false);
    expect(isLive(base, at('2026-10-01T13:00:00Z'))).toBe(true);
    expect(isLive(base, at('2026-10-29T16:31:00Z'))).toBe(false);
  });
});
