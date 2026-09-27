import { confirmedIcs, holdTheDateIcs } from '@/lib/ics';
import { findSession, loadSessions } from '@/lib/sessions';

export const dynamic = 'force-dynamic';

/**
 * Calendar file for a workshop.
 *   /api/calendar/{code}              "hold the date", offered right after someone requests a seat
 *   /api/calendar/{code}?confirmed=1  the confirmed event, linked from the accepted email
 * Both share a UID, so the confirmed one replaces the hold rather than duplicating it.
 */
export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const { sessions } = await loadSessions();
  const s = findSession(sessions, code);
  if (!s || s.status === 'cancelled') return new Response('Workshop not found', { status: 404 });
  const confirmed = new URL(req.url).searchParams.get('confirmed') === '1';
  const filename = `claude-workshop-${s.code}${confirmed ? '-confirmed' : ''}.ics`;
  return new Response(confirmed ? confirmedIcs(s) : holdTheDateIcs(s), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
