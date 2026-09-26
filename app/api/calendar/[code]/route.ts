import { holdTheDateIcs } from '@/lib/ics';
import { findSession, loadSessions } from '@/lib/sessions';

export const dynamic = 'force-dynamic';

/** "Hold the date" calendar file offered right after someone requests a seat. */
export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const { sessions } = await loadSessions();
  const s = findSession(sessions, code);
  if (!s || s.status === 'cancelled') return new Response('Workshop not found', { status: 404 });
  return new Response(holdTheDateIcs(s), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="claude-workshop-${s.code}.ics"`,
      'Cache-Control': 'no-store',
    },
  });
}
