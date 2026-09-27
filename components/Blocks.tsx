import Link from 'next/link';
import { Fragment } from 'react';
import { site } from '@/lib/config';
import { BRIEF_EXAMPLE, type CASES } from '@/lib/content';
import { placeLabel, seatInfo } from '@/lib/sessions';
import { dowShort, fDay, fTime, monthDay, zoneLabel } from '@/lib/time';
import type { Session } from '@/lib/types';
import { Icon } from './Icon';
import { RichText } from './RichText';

export function SeatsBar({ s }: { s: Pick<Session, 'seats' | 'accepted' | 'status'> }) {
  const k = seatInfo(s);
  const cls = k.full ? 'full' : k.low ? 'low' : '';
  const label = k.full ? 'Full · join the waitlist' : `${k.left} of ${s.seats} seats left`;
  return (
    <div className={`seats ${cls}`.trim()}>
      <p className="seats-label">{label}</p>
      <div className="bar" role="img" aria-label={label}><span style={{ width: `${k.pct}%` }} /></div>
    </div>
  );
}

export function timeRange(s: Pick<Session, 'start' | 'end' | 'format' | 'timeZone' | 'date'>) {
  const zone = s.format === 'online' ? ` ${zoneLabel(s.timeZone, s.date)}` : '';
  return `${fTime(s.start)} – ${fTime(s.end)}${zone}`;
}

export function SessionCard({ s, soon }: { s: Session; soon: boolean }) {
  const k = seatInfo(s);
  return (
    <article className={`session ${soon ? 'soon' : ''}`.trim()}>
      <div className="datechip" aria-hidden="true"><span>{dowShort(s.date)}</span><strong>{monthDay(s.date)}</strong></div>
      <div>
        {s.title
          ? <><h3 className="s-title">{s.title}</h3><p className="s-where">{placeLabel(s)}{s.format === 'online' || !s.room ? '' : ` · ${s.room}`}</p></>
          : <h3>{placeLabel(s)}{s.format === 'online' || !s.room ? '' : ` · ${s.room}`}</h3>}
        <p className="s-meta">
          <span><Icon name="calendar-days" /> {fDay(s.date)}</span>
          <span><Icon name="clock" /> {timeRange(s)}</span>
          <span><Icon name={s.format === 'online' ? 'laptop' : 'map-pin'} /> {s.format === 'online' ? 'Online' : 'In person'}</span>
        </p>
        <span className="s-free">Free</span>
      </div>
      <SeatsBar s={s} />
      <Link className={`btn ${k.full ? 'btn-outline' : 'btn-primary'}`} href={`/request/${s.code}`}>
        {k.full ? 'Join the waitlist' : 'Request a seat'}
      </Link>
    </article>
  );
}

export function TrainerCard({ next }: { next?: Session }) {
  const t = site.trainer;
  return (
    <aside className="trainer-card" aria-label="Your trainer">
      <div className="tc-top">
        <div className="avatar" aria-hidden={t.photo ? undefined : true}>
          {t.photo ? <img src={t.photo} alt={t.name} width={88} height={88} /> : t.initials}
        </div>
        <div>
          <p className="kicker">Your trainer</p>
          <p className="tc-name">{t.name}</p>
          <p className="badge"><Icon name="badge-check" /> {t.credential}</p>
        </div>
      </div>
      <p className="tc-bio">{t.bio}</p>
      <div className="tc-next">
        <p className="kicker">Next workshop</p>
        {next ? (
          <>
            {next.title && <p className="tc-title">{next.title}</p>}
            <p className="tc-when">{fDay(next.date)} · {placeLabel(next)}</p>
            <p className="tc-time">{timeRange(next)} · Free</p>
            <SeatsBar s={next} />
            <Link className="btn btn-primary btn-sm tc-btn" href={`/request/${next.code}`}>Request a seat <Icon name="arrow-right" /></Link>
          </>
        ) : (
          <>
            <p className="tc-when">Next dates coming soon</p>
            <p className="tc-time">Tell us about your business and you’ll be first to hear.</p>
            <Link className="btn btn-primary btn-sm tc-btn" href="/request/any">Save my spot for the next one</Link>
          </>
        )}
      </div>
    </aside>
  );
}

export function BriefCard() {
  return (
    <div className="brief" aria-label="Example: Monday Brief">
      <div className="brief-top"><p className="kicker">What you could build</p><span className="running">RUNNING</span></div>
      <h3>Monday Brief</h3>
      <p className="brief-desc">One page every Monday at 7:00 am. Reads QuickBooks, PayPal, HubSpot and your calendar.</p>
      <div className="kpis">
        {BRIEF_EXAMPLE.kpis.map((k) => (
          <div key={k.label} className={`kpi ${k.tone}`.trim()}><strong>{k.value}</strong><span>{k.label}</span></div>
        ))}
      </div>
      <div className="top3">
        <h4>Top 3 this week</h4>
        <ul>
          {BRIEF_EXAMPLE.top3.map((t) => (
            <li key={t.text}><span className={`tick ${t.ok ? 'ok' : ''}`.trim()}><Icon name="check" /></span><span>{t.text}</span></li>
          ))}
        </ul>
      </div>
      <p className="brief-foot">Example output with sample numbers.</p>
    </div>
  );
}

export function CaseCard({ c }: { c: (typeof CASES)[number] }) {
  return (
    <article className="case">
      <div><p className="kicker">{c.job}</p><h3>{c.who}</h3><p className="case-where">{c.where}</p></div>
      <div className="ba">
        <div className="ba-col before"><p className="ba-label"><Icon name="clock" /> Before</p><p>{c.before}</p></div>
        <div className="ba-col after"><p className="ba-label"><Icon name="circle-check" /> After</p><p>{c.after}</p></div>
      </div>
      <dl className="split">
        <div><dt>AI handles</dt><dd>{c.ai}</dd></div>
        <div><dt>{c.keeps}</dt><dd>{c.owner}</dd></div>
      </dl>
      <blockquote className="case-quote">“{c.quote}”</blockquote>
    </article>
  );
}

export function FaqItem({ q, a }: { q: string; a: string[] }) {
  return (
    <details className="faq-item">
      <summary>{q}<Icon name="chevron-down" /></summary>
      <div className="a">{a.map((p) => <p key={p}><RichText text={p} /></p>)}</div>
    </details>
  );
}

/** Renders config headline lines; *word* becomes the orange highlight, and the last two words stay together. */
export function Headline({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((line, i) => {
        const glued = line.replace(/ (\S+)$/, ' $1');
        const parts = glued.split(/\*([^*]+)\*/);
        return (
          <Fragment key={line}>
            {parts.map((p, j) => (j % 2 === 1 ? <em key={j}>{p}</em> : <Fragment key={j}>{p}</Fragment>))}
            {i < lines.length - 1 && <br />}
          </Fragment>
        );
      })}
    </>
  );
}
