import { describe, expect, it } from 'vitest';
import { findSession, liveGroups, normalizeSession, seatInfo, toHHMM, toPublic, upcomingPublic } from '@/lib/sessions';
import { sampleSessions } from '@/lib/sample-data';

describe('reading sheet rows', () => {
  it('parses times in several formats', () => {
    expect(toHHMM('9:00')).toBe('09:00');
    expect(toHHMM('09:30')).toBe('09:30');
    expect(toHHMM('1:30 pm')).toBe('13:30');
    expect(toHHMM('12:00 AM')).toBe('00:00');
    expect(toHHMM('12 pm')).toBe('12:00');
    expect(toHHMM('25:00')).toBe('');
    expect(toHHMM('noon')).toBe('');
  });

  it('normalizes a full row', () => {
    const s = normalizeSession({
      code: '', status: '', date: '2026-10-15', start: '9:00 AM', end: '12:30 PM', timezone: '', format: 'In person',
      city: 'Easthampton, MA', venue: 'Hall', room: 'Main', seats: '20', accepted: '16', cohortPassword: ' pw ',
    });
    expect(s).not.toBeNull();
    expect(s!.code).toBe('2026-10-15-easthampton');
    expect(s!.status).toBe('open');
    expect(s!.start).toBe('09:00');
    expect(s!.end).toBe('12:30');
    expect(s!.timeZone).toBe('America/New_York');
    expect(s!.seats).toBe(20);
    expect(s!.accepted).toBe(16);
    expect(s!.cohortPassword).toBe('pw');
  });

  it('recognizes online sessions and statuses', () => {
    const s = normalizeSession({ date: '2026-11-04', start: '12:00', end: '15:30', format: 'Virtual (Zoom)', status: 'Draft' });
    expect(s!.format).toBe('online');
    expect(s!.city).toBe('Online');
    expect(s!.status).toBe('draft');
    expect(normalizeSession({ date: '2026-11-04', start: '12:00', end: '15:30', status: 'Cancelled' })!.status).toBe('cancelled');
    expect(normalizeSession({ date: '2026-11-04', start: '12:00', end: '15:30', status: 'Full' })!.status).toBe('full');
  });

  it('skips rows without a date or times', () => {
    expect(normalizeSession({ date: 'next week', start: '9:00', end: '12:00' })).toBeNull();
    expect(normalizeSession({ date: '2026-10-15', start: '', end: '12:00' })).toBeNull();
  });

  it('falls back to the default zone for an unknown zone', () => {
    expect(normalizeSession({ date: '2026-10-15', start: '9:00', end: '12:00', timezone: 'Mars/Base' })!.timeZone).toBe('America/New_York');
  });
});

describe('seats', () => {
  it('computes seats left and the low/full states', () => {
    expect(seatInfo({ seats: 20, accepted: 12, status: 'open' })).toEqual({ left: 8, pct: 60, low: false, full: false });
    expect(seatInfo({ seats: 20, accepted: 16, status: 'open' })).toMatchObject({ left: 4, low: true, full: false });
    expect(seatInfo({ seats: 20, accepted: 20, status: 'open' })).toMatchObject({ left: 0, full: true });
    expect(seatInfo({ seats: 20, accepted: 3, status: 'full' })).toMatchObject({ full: true, pct: 100 });
  });
});

describe('lists', () => {
  const now = new Date('2026-09-26T14:00:00Z');
  const sample = sampleSessions(now);

  it('lists upcoming open and full workshops, soonest first, hiding past ones and drafts', () => {
    const withDraft = [...sample, { ...sample[1], code: 'draft-one', status: 'draft' as const }];
    const list = upcomingPublic(withDraft, now);
    expect(list.map((s) => s.code)).toEqual(sample.slice(1).map((s) => s.code));
  });

  it('keeps private fields out of the public shape', () => {
    const p = toPublic(sample[1]) as unknown as Record<string, unknown>;
    expect(p.cohortPassword).toBeUndefined();
    expect(p.promoCode).toBeUndefined();
    expect(p.workshopLink).toBeUndefined();
  });

  it('groups the front door by stage', () => {
    const g = liveGroups(sample, now);
    expect(g.recent.map((s) => s.city)).toEqual(['Springfield, MA']);
    expect(g.soon.map((s) => s.city)).toEqual(['Holyoke, MA']);
    expect(g.today).toEqual([]);
  });

  it('finds workshops by code but never drafts', () => {
    expect(findSession(sample, sample[2].code)?.city).toBe('Easthampton, MA');
    expect(findSession([{ ...sample[2], status: 'draft' }], sample[2].code)).toBeUndefined();
  });
});
