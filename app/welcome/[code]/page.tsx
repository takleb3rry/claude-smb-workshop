import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { timeRange } from '@/components/Blocks';
import { Email, MiniHeader, SampleRibbon } from '@/components/Chrome';
import { Icon } from '@/components/Icon';
import { CopyButton, ReadyChecklist } from '@/components/Interactive';
import { site } from '@/lib/config';
import { GET_READY, runOrder, STUCK_TIPS } from '@/lib/content';
import { findSession, loadSessions, placeLabel } from '@/lib/sessions';
import {
  addMinutes, daysBetween, daysLeftInWindow, endsAt, fDay, fLong, fTime, stageOf, startsAt, todayIn,
  weekdayLong, windowEndDay, zonedTimeToUtc,
} from '@/lib/time';
import type { Session, Stage } from '@/lib/types';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ code: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { code } = await params;
  const { sessions } = await loadSessions();
  const s = findSession(sessions, code);
  return {
    title: s ? [s.title, 'Welcome', fDay(s.date), placeLabel(s)].filter(Boolean).join(' · ') : 'Welcome',
    robots: { index: false, follow: false },
  };
}

/** For ?preview=… links: a sensible "now" inside the chosen stage. */
function previewNow(s: Session, stage: Exclude<Stage, 'ended'>): Date {
  if (stage === 'before') return new Date(startsAt(s).getTime() - 3 * 86_400_000);
  if (stage === 'dayof') return new Date(startsAt(s).getTime() + 40 * 60_000);
  return new Date(endsAt(s).getTime() + 5 * 86_400_000);
}

function mapLink(s: Session): string {
  if (s.mapUrl) return s.mapUrl;
  if (!s.address) return '';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([s.venue, s.address].filter(Boolean).join(', '))}`;
}

function Secret({ label, value, copy = true, huge = false }: { label: string; value: string; copy?: boolean; huge?: boolean }) {
  return (
    <div className={`secret ${huge ? 'huge' : ''}`.trim()}>
      <div><p className="label">{label}</p><p className="val">{value}</p></div>
      {copy && <CopyButton text={value} />}
    </div>
  );
}

function RunOrder({ s, now }: { s: Session; now?: Date }) {
  const rows = runOrder(s.start, s.end, addMinutes);
  let nowIdx = -1;
  if (now) rows.forEach((r, i) => { if (zonedTimeToUtc(s.date, r.at, s.timeZone) <= now) nowIdx = i; });
  return (
    <section className="pcard">
      <h2><Icon name="clock" /> Running order</h2>
      <ol className="runorder">
        {rows.map((r, i) => (
          <li key={r.title} className={i === nowIdx ? 'now' : undefined}>
            <time>{fTime(r.at)}</time>
            <div><strong>{r.title}</strong>{i === nowIdx && <span className="now-tag">Now</span>}<p>{r.note}</p></div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Promo({ s }: { s: Session }) {
  if (!s.promoCode) return null;
  return (
    <section className="pcard">
      <h2><Icon name="ticket" /> Your promo code</h2>
      <Secret label="Code" value={s.promoCode} />
      <div className="promo-meta">
        <div><span>What it unlocks</span>{s.promoUnlocks || 'Details coming soon'}</div>
        <div><span>Where to redeem</span>{s.promoRedeem || 'Details coming soon'}</div>
        <div><span>Expires</span>{s.promoExpires || '—'}</div>
      </div>
    </section>
  );
}

export default async function WorkshopPage({ params, searchParams }: Params) {
  const { code } = await params;
  const sp = await searchParams;
  const realNow = new Date();
  const { sessions, error } = await loadSessions(realNow);
  const s = findSession(sessions, code);

  if (!s) {
    if (!error) notFound();
    return (
      <>
        <MiniHeader backHref="/welcome" backLabel="All welcome pages" />
        <main id="main" className="page-panel">
          <div className="narrow error-page">
            <h1>We couldn’t load your workshop just now.</h1>
            <p>Refresh this page in a minute. If it still doesn’t load, email <Email />.</p>
          </div>
        </main>
      </>
    );
  }

  const preview = typeof sp.preview === 'string' && ['before', 'dayof', 'after'].includes(sp.preview) ? (sp.preview as Exclude<Stage, 'ended'>) : null;
  const realStage = stageOf(s, realNow);
  // Previewing the stage the workshop is really in shows the real countdown, not a made-up one.
  const now = preview && preview !== realStage ? previewNow(s, preview) : realNow;
  const stage: Stage = preview ?? realStage;
  const where = placeLabel(s);
  const daysToGo = daysBetween(todayIn(s.timeZone, now), s.date);
  const left = daysLeftInWindow(s, now);

  const pill =
    s.status === 'cancelled' ? <span className="stage-pill"><Icon name="info" /> Cancelled</span>
    : stage === 'before' ? <span className="stage-pill"><Icon name="calendar-days" /> {daysToGo <= 0 ? 'Today' : daysToGo === 1 ? 'Tomorrow' : `In ${daysToGo} days`}</span>
    : stage === 'dayof' ? <span className="stage-pill today"><Icon name="zap" /> Today</span>
    : stage === 'after' ? <span className="stage-pill after"><Icon name="circle-check" /> Resources open · {left} {left === 1 ? 'day' : 'days'} left</span>
    : <span className="stage-pill after"><Icon name="circle-check" /> Wrapped</span>;

  const heading =
    s.status === 'cancelled' ? 'This workshop was cancelled.'
    : stage === 'before' ? `You’re all set for ${weekdayLong(s.date)}.`
    : stage === 'dayof' ? 'Welcome. Let’s get you signed in.'
    : stage === 'after' ? 'Nice work. Keep going.'
    : 'This workshop has wrapped.';

  const details = (
    <section className="pcard">
      <h2><Icon name="map-pin" /> When and where</h2>
      <dl className="kv">
        <dt>When</dt>
        <dd>{fLong(s.date)}<small>{timeRange(s)}.{s.format === 'online' ? '' : ` Doors open at ${fTime(addMinutes(s.start, -site.doorsOpenMinutes))}.`}</small></dd>
        <dt>Where</dt>
        <dd>
          {[s.venue, s.room].filter(Boolean).join(', ') || where}
          {s.address && <small>{s.address}{mapLink(s) && <> · <a className="email" href={mapLink(s)} target="_blank" rel="noopener noreferrer">Map</a></>}</small>}
        </dd>
        {s.parking && (<><dt>Parking</dt><dd>{s.parking}</dd></>)}
        <dt>Questions</dt><dd><Email /></dd>
      </dl>
    </section>
  );

  const access = (
    <section className="pcard">
      <h2><Icon name="key-round" /> Workshop link and password</h2>
      <p>You’ll use these on the day. They’re here so nobody has to type them from a slide.</p>
      {s.workshopLink ? <Secret label="Workshop link" value={s.workshopLink} /> : <p className="hint">The workshop link will appear here before the day.</p>}
      {s.cohortPassword ? <Secret label="Cohort password" value={s.cohortPassword} /> : <p className="hint">The cohort password will appear here before the day.</p>}
    </section>
  );

  let body: React.ReactNode;
  if (s.status === 'cancelled') {
    body = (
      <section className="pcard">
        <h2><Icon name="info" /> Sorry about this</h2>
        <p>This workshop isn’t going ahead. We’ll email everyone who had a seat. Questions? Email <Email />.</p>
        <p style={{ marginTop: 14 }}><Link className="btn btn-primary btn-sm" href="/#workshops">See other workshops <Icon name="arrow-right" /></Link></p>
      </section>
    );
  } else if (stage === 'before') {
    body = (
      <>
        {details}
        <section className="pcard">
          <h2><Icon name="list-checks" /> Get ready (about 10 minutes)</h2>
          <ReadyChecklist items={GET_READY} storageKey={`cmc-ready-${s.code}`} />
        </section>
        <Promo s={s} />
        {access}
        <RunOrder s={s} />
      </>
    );
  } else if (stage === 'dayof') {
    body = (
      <>
        <section className="pcard">
          <h2><Icon name="door-open" /> Get in: {s.wifiName ? 'three' : 'two'} steps</h2>
          <div className="dsteps">
            {s.wifiName && (
              <div className="dstep">
                <span className="dnum">1</span>
                <div>
                  <h3>Join the Wi-Fi</h3>
                  <Secret label="Network" value={s.wifiName} copy={false} />
                  {s.wifiPassword && <Secret label="Wi-Fi password" value={s.wifiPassword} />}
                </div>
              </div>
            )}
            <div className="dstep">
              <span className="dnum">{s.wifiName ? 2 : 1}</span>
              <div>
                <h3>Open the workshop</h3>
                {s.workshopLink ? (
                  <>
                    <a className="btn btn-primary btn-lg" href={s.workshopLink} target="_blank" rel="noopener noreferrer">Open the workshop app <Icon name="external-link" /></a>
                    <span className="linktext">{s.workshopLink}</span>
                  </>
                ) : <p className="hint">The link is on the screen at the front of the room.</p>}
              </div>
            </div>
            <div className="dstep">
              <span className="dnum">{s.wifiName ? 3 : 2}</span>
              <div>
                <h3>Enter the cohort password and your name</h3>
                {s.cohortPassword ? <Secret label="Cohort password" value={s.cohortPassword} huge /> : <p className="hint">The password is on the screen at the front of the room.</p>}
              </div>
            </div>
          </div>
        </section>
        <section className="pcard">
          <h2><Icon name="lightbulb" /> If you get stuck</h2>
          <ul className="tips">{STUCK_TIPS.map((t) => <li key={t}><Icon name="info" /><span>{t}</span></li>)}</ul>
        </section>
        <RunOrder s={s} now={now} />
        <Promo s={s} />
      </>
    );
  } else if (stage === 'after') {
    body = (
      <>
        <div className="after-banner">
          <div><strong>{left} {left === 1 ? 'day' : 'days'} left</strong><p>The workshop app stays open until {windowEndDay(s)}.</p></div>
          {s.workshopLink && <a className="btn btn-dark" href={s.workshopLink} target="_blank" rel="noopener noreferrer">Keep building <Icon name="external-link" /></a>}
        </div>
        <div className="link-grid">
          <div className="lcard">
            <span className="ico"><Icon name="book-open" /></span>
            <h3>Take-home track</h3>
            <p>Every step from the day, with prompts you can copy, so you can keep going at your own pace.</p>
            <Link className="btn btn-primary btn-sm" href="/resources">Open the take-home track <Icon name="arrow-right" /></Link>
          </div>
          {s.workshopLink && (
            <div className="lcard">
              <span className="ico"><Icon name="trophy" /></span>
              <h3>Leaderboard</h3>
              <p>Earn points as you complete steps in the workshop app, and see how you stack up.</p>
              <a className="btn btn-outline btn-sm" href={s.workshopLink} target="_blank" rel="noopener noreferrer">See the leaderboard <Icon name="external-link" /></a>
            </div>
          )}
          {s.surveyLink && (
            <div className="lcard">
              <span className="ico"><Icon name="clipboard-list" /></span>
              <h3>Tell us how it went</h3>
              <p>Two minutes. It shapes the next workshop.</p>
              <a className="btn btn-outline btn-sm" href={s.surveyLink} target="_blank" rel="noopener noreferrer">Take the survey <Icon name="external-link" /></a>
            </div>
          )}
          <div className="lcard">
            <span className="ico"><Icon name="mail" /></span>
            <h3>Questions?</h3>
            <p>Stuck on something you started? Email <Email /></p>
          </div>
        </div>
      </>
    );
  } else {
    body = (
      <section className="pcard ended-card">
        <h2><Icon name="book-open" /> The take-home track is still here</h2>
        <p>The two-week window for this workshop has closed, but the take-home track and resources stay open.</p>
        <p style={{ marginTop: 14 }}><Link className="btn btn-primary btn-sm" href="/resources">Open the take-home track <Icon name="arrow-right" /></Link></p>
      </section>
    );
  }

  return (
    <>
      <SampleRibbon />
      <MiniHeader backHref="/welcome" backLabel="All welcome pages" />
      <main id="main" className="page-panel">
        <div className="portal-hero">
          <div className="narrow">
            {pill}
            {s.title && <p className="portal-title">{s.title}</p>}
            <h1>{heading}</h1>
            <p>{fDay(s.date)} · {where} · {timeRange(s)}</p>
            {preview && (
              <nav className="stage-switch" aria-label="Preview this page as">
                <span className="lbl">Preview as</span>
                {(['before', 'dayof', 'after'] as const).map((k) => (
                  <Link key={k} href={`/welcome/${s.code}?preview=${k}`} aria-current={preview === k ? 'true' : undefined}>
                    {{ before: 'Before', dayof: 'Day of', after: 'After' }[k]}
                  </Link>
                ))}
              </nav>
            )}
          </div>
        </div>
        <div className="narrow portal">{body}</div>
      </main>
    </>
  );
}
