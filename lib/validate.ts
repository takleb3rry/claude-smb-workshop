import { AI_STAGES, AI_TOOLS, BIZ_TOOLS, CLAUDE_NOW, FIRST_TASK, INDUSTRIES, ROLES, SIZES } from './options';
import type { RequestAnswers } from './types';

export type Errors = Partial<Record<'industry' | 'size' | 'role' | 'ai' | 'claude' | 'contact' | 'laptop' | 'code', string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const emptyAnswers = (code = 'any'): RequestAnswers => ({
  code, industry: '', size: '', role: '', ai: '', claude: '',
  tools: [], aiTools: [], task: '',
  name: '', email: '', company: '', phone: '', laptop: false, access: '',
});

/** Checks one step of the form. Step 3 has no required answers. */
export function validateStep(step: number, a: RequestAnswers): Errors {
  const e: Errors = {};
  if (step === 1) {
    if (!INDUSTRIES.some((i) => i.value === a.industry)) e.industry = 'Pick the kind of business that fits best.';
    if (!SIZES.includes(a.size)) e.size = 'Choose a team size.';
  }
  if (step === 2) {
    if (!ROLES.includes(a.role)) e.role = 'Choose your role.';
    if (!AI_STAGES.some((s) => s.label === a.ai)) e.ai = 'Pick the one that sounds most like you.';
    if (!CLAUDE_NOW.includes(a.claude)) e.claude = 'Tell us whether you have Claude today.';
  }
  if (step === 4) {
    const missing: string[] = [];
    if (!a.name.trim()) missing.push('your name');
    if (!EMAIL.test(a.email.trim())) missing.push('an email we can reach you at');
    if (!a.company.trim()) missing.push('your company');
    if (missing.length) e.contact = `Add ${missing.join(', ')}.`;
    if (!a.laptop) e.laptop = 'Tick the laptop box so we know you’ll have one on the day.';
  }
  return e;
}

const clip = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const pickList = (v: unknown, allowed: string[]) =>
  Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === 'string' && allowed.includes(x)))] : [];

/** Server-side: clean the posted body and check every step. */
export function parseRequest(body: unknown): { answers: RequestAnswers; errors: Errors } {
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  const answers: RequestAnswers = {
    code: clip(b.code, 80) || 'any',
    industry: clip(b.industry, 40),
    size: clip(b.size, 20),
    role: clip(b.role, 60),
    ai: clip(b.ai, 120),
    claude: clip(b.claude, 40),
    tools: pickList(b.tools, BIZ_TOOLS),
    aiTools: pickList(b.aiTools, AI_TOOLS),
    task: FIRST_TASK.includes(clip(b.task, 60)) ? clip(b.task, 60) : '',
    name: clip(b.name, 120),
    email: clip(b.email, 200).toLowerCase(),
    company: clip(b.company, 160),
    phone: clip(b.phone, 40),
    laptop: b.laptop === true,
    access: clip(b.access, 1000),
  };
  const errors: Errors = { ...validateStep(1, answers), ...validateStep(2, answers), ...validateStep(4, answers) };
  if (!/^[a-z0-9-]+$/.test(answers.code)) errors.code = 'Pick a workshop.';
  return { answers, errors };
}
