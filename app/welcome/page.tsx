import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { timeRange } from '@/components/Blocks';
import { Email, MiniHeader, SampleRibbon } from '@/components/Chrome';
import { Icon } from '@/components/Icon';
import { liveGroups, loadSessions, placeLabel } from '@/lib/sessions';
import { daysBetween, fDay, fTime, todayIn, windowEndDay } from '@/lib/time';
import type { Session } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Welcome', robots: { index: false, follow: false } };

function HubCard({ s, kind, now }: { s: Session; kind: 'today' | 'soon' | 'recent'; now: Date }) {
  const days = daysBetween(todayIn(s.timeZone, now), s.date);
  const line =
    kind === 'today' ? `Today · ${timeRange(s)}${s.room ? ` · ${s.room}` : ''}`
    : kind === 'soon' ? `${days <= 0 ? 'Today' : days === 1 ? 'Tomorrow' : `In ${days} days`} · ${fTime(s.start)}${s.room || s.venue ? ` · ${s.room || s.venue}` : ''}`
    : `Finished · resources open until ${windowEndDay(s)}`;
  return (
    <div className={`hub-card ${kind === 'today' ? 'today' : ''}`.trim()}>
      <div>
        {s.title
          ? <><h3>{s.title}</h3><p className="hub-where">{fDay(s.date)} · {placeLabel(s)}</p></>
          : <h3>{fDay(s.date)} · {placeLabel(s)}</h3>}
        <p>{line}</p>
      </div>
      <Link className={`btn ${kind === 'today' ? 'btn-primary' : 'btn-outline'}`} href={`/welcome/${s.code}`}>
        Open my welcome page <Icon name="arrow-right" />
      </Link>
    </div>
  );
}

export default async function WelcomeHub() {
  const now = new Date();
  const { sessions, error } = await loadSessions(now);
  const g = liveGroups(sessions, now);
  if (!error && g.all.length === 1) redirect(`/welcome/${g.all[0].code}`);

  const group = (title: string, list: Session[], kind: 'today' | 'soon' | 'recent') =>
    list.length ? (
      <section className="hub-group">
        <h2>{title}</h2>
        {list.map((s) => <HubCard key={s.code} s={s} kind={kind} now={now} />)}
      </section>
    ) : null;

  return (
    <>
      <SampleRibbon />
      <MiniHeader backHref="/" backLabel="Homepage" />
      <main id="main" className="page-panel">
        <div className="page-head">
          <div className="narrow">
            <p className="eyebrow">Welcome</p>
            <h1>Find your workshop.</h1>
            <p>Your welcome page has everything for the day: where to go, how to get signed in, and what to do after.</p>
          </div>
        </div>
        <div className="narrow">
          {error && <p className="notice error"><Icon name="circle-alert" /> <span>We couldn’t load the workshops just now. Refresh in a minute, or use the link in your confirmation email.</span></p>}
          {group('Today', g.today, 'today')}
          {group('Coming up', g.soon, 'soon')}
          {group('Recently finished', g.recent, 'recent')}
          {!error && g.all.length === 0 && (
            <div className="empty" style={{ marginTop: 30 }}>
              <h3>No workshops are running right now.</h3>
              <p>Your welcome page opens two weeks before your workshop. See what’s coming up on the homepage.</p>
              <Link className="btn btn-primary" href="/#workshops">See upcoming workshops <Icon name="arrow-right" /></Link>
            </div>
          )}
          <p className="hub-note">Can’t find yours? Email <Email /></p>
        </div>
      </main>
    </>
  );
}
