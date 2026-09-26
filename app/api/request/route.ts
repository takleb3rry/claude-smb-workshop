import { dataMode, site } from '@/lib/config';
import { fitFlags } from '@/lib/fit';
import { allow } from '@/lib/rate-limit';
import { loadSessions, upcomingPublic } from '@/lib/sessions';
import { parseRequest } from '@/lib/validate';

export const dynamic = 'force-dynamic';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

/**
 * Saves a seat request.
 * Contract with the sheet script: POST {APPS_SCRIPT_URL}
 *   body { action: 'request', key, request: { submittedAt, code, industry, size, role, ai, claude, tools[], aiTools[],
 *          task, name, email, company, phone, laptop, access, fit: { role, size, ai, score } } }
 *   → { ok: true } (the script appends a Requests row and sends the "request received" email)
 */
export async function POST(req: Request) {
  const tooBig = Number(req.headers.get('content-length') || 0) > 20_000;
  if (tooBig) return json({ ok: false, error: 'That request is too large.' }, 413);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: 'We couldn’t read that request. Please try again.' }, 400);
  }

  // Spam trap: people never fill the hidden "website" field. Pretend it worked.
  if (body && typeof body === 'object' && (body as Record<string, unknown>).website) return json({ ok: true });

  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
  if (!allow(ip)) return json({ ok: false, error: `Too many requests from this connection. Please wait a few minutes, or email ${site.contactEmail}.` }, 429);

  const { answers, errors } = parseRequest(body);
  if (Object.keys(errors).length) return json({ ok: false, errors }, 400);

  const mode = dataMode();
  if (mode === 'off') {
    return json({ ok: false, error: `Requests open soon. In the meantime, email ${site.contactEmail} and we’ll add you to the list.` }, 503);
  }

  const now = new Date();
  if (answers.code !== 'any') {
    const { sessions } = await loadSessions(now);
    if (!upcomingPublic(sessions, now).some((s) => s.code === answers.code)) {
      return json({ ok: false, errors: { code: 'That workshop isn’t taking requests anymore. Pick another one, or choose “Any upcoming workshop.”' } }, 400);
    }
  }

  const request = { submittedAt: now.toISOString(), ...answers, fit: fitFlags(answers) };

  if (mode === 'sample') {
    console.info('[sample mode] request received, not saved:', JSON.stringify({ ...request, email: '(hidden)', phone: '(hidden)' }));
    return json({ ok: true, sample: true });
  }

  try {
    const res = await fetch(process.env.APPS_SCRIPT_URL as string, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'request', key: process.env.APPS_SCRIPT_SECRET, request }),
      cache: 'no-store',
      redirect: 'follow',
    });
    const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (!res.ok || !data?.ok) throw new Error(data?.error || `Sheet responded ${res.status}`);
    return json({ ok: true });
  } catch (err) {
    console.error('[request] could not save to the sheet:', err);
    return json({ ok: false, error: `We couldn’t save your request just now. Please try again in a minute, or email ${site.contactEmail}.` }, 502);
  }
}
