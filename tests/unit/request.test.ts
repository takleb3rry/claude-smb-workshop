import { describe, expect, it } from 'vitest';
import { fitFlags } from '@/lib/fit';
import { holdTheDateIcs } from '@/lib/ics';
import { sampleSessions } from '@/lib/sample-data';
import { emptyAnswers, parseRequest, validateStep } from '@/lib/validate';

const good = {
  code: 'any', industry: 'trades', size: '21–100', role: 'Owner or founder',
  ai: 'I use ChatGPT or Claude for emails and ideas. That’s about it.', claude: 'Pro or Max',
  tools: ['QuickBooks', 'Not a real tool'], aiTools: ['Claude'], task: 'Follow-ups',
  name: ' Pat Lopez ', email: 'Pat@Example.com', company: 'Lopez Heating', phone: '', laptop: true, access: '',
};

describe('fit checks', () => {
  it('scores owners of 5–500 person teams who are new to AI as 3/3', () => {
    expect(fitFlags(good)).toEqual({ role: true, size: true, ai: true, score: 3 });
  });
  it('flags staff, very small teams and people already automating', () => {
    expect(fitFlags({ role: 'Team member', size: 'Under 5', ai: 'I write code or build with AI tools myself.' }).score).toBe(0);
    expect(fitFlags({ role: 'Manager', size: '500+', ai: 'I’ve barely touched AI. Curious, a little skeptical.' })).toEqual({ role: false, size: false, ai: true, score: 1 });
  });
});

describe('validation', () => {
  it('requires the step 1 and 2 answers', () => {
    expect(Object.keys(validateStep(1, emptyAnswers()))).toEqual(['industry', 'size']);
    expect(Object.keys(validateStep(2, emptyAnswers()))).toEqual(['role', 'ai', 'claude']);
    expect(validateStep(3, emptyAnswers())).toEqual({});
  });
  it('requires contact details and the laptop box on step 4', () => {
    const e = validateStep(4, { ...emptyAnswers(), email: 'not-an-email' });
    expect(e.contact).toBe('Add your name, an email we can reach you at, your company.');
    expect(e.laptop).toBeDefined();
  });
  it('cleans a posted request and drops unknown choices', () => {
    const { answers, errors } = parseRequest(good);
    expect(errors).toEqual({});
    expect(answers.name).toBe('Pat Lopez');
    expect(answers.email).toBe('pat@example.com');
    expect(answers.tools).toEqual(['QuickBooks']);
  });
  it('rejects a bad workshop code and non-boolean laptop values', () => {
    const { errors } = parseRequest({ ...good, code: '../etc', laptop: 'yes' });
    expect(errors.code).toBeDefined();
    expect(errors.laptop).toBeDefined();
  });
});

describe('hold-the-date file', () => {
  it('builds a tentative event in UTC without the welcome link', () => {
    const s = { ...sampleSessions(new Date('2026-09-26T14:00:00Z'))[2], date: '2026-10-15' };
    const ics = holdTheDateIcs(s, new Date('2026-09-26T14:00:00Z'));
    expect(ics).toContain('DTSTART:20261015T130000Z');
    expect(ics).toContain('DTEND:20261015T163000Z');
    expect(ics).toContain('STATUS:TENTATIVE');
    expect(ics).not.toContain('/welcome/');
    expect(ics.split('\r\n').every((l) => Buffer.byteLength(l) <= 75)).toBe(true);
  });
});
