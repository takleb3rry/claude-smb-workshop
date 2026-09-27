'use client';

import { useEffect, useRef, useState } from 'react';
import { sizeOutOfRange } from '@/lib/fit';
import {
  AI_STAGES, AI_TOOLS, BIZ_TOOLS, CLAUDE_NOW, FIRST_TASK, INDUSTRIES, ROLES, SIZES, STEP_NAMES, TIME_LEFT,
} from '@/lib/options';
import { fDay } from '@/lib/time';
import type { PublicSession, RequestAnswers } from '@/lib/types';
import { emptyAnswers, validateStep, type Errors } from '@/lib/validate';
import { Icon } from './Icon';
import { ShareButton } from './Interactive';

const DRAFT_KEY = 'cmc-request-draft';

function place(s: PublicSession) {
  return s.format === 'online' ? `Online · ${s.venue || 'Zoom'}` : s.city;
}

function Err({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="err" role="alert"><Icon name="circle-alert" /> {msg}</p>;
}

interface Props {
  sessions: PublicSession[];
  initialCode: string;
  unknownCode: boolean;
  reviewDays: number;
  contactEmail: string;
  siteUrl: string;
}

export function RequestFlow({ sessions, initialCode, unknownCode, reviewDays, contactEmail, siteUrl }: Props) {
  const [step, setStep] = useState(1);
  const [a, setA] = useState<RequestAnswers>(() => emptyAnswers(initialCode));
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [done, setDone] = useState(false);
  const [website, setWebsite] = useState(''); // spam trap, stays empty for people
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  // Restore an unfinished draft from this browser (convenience only).
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
      if (saved && typeof saved === 'object') setA((prev) => ({ ...prev, ...saved, code: prev.code }));
    } catch { /* storage unavailable */ }
  }, []);

  useEffect(() => {
    if (done) return;
    try {
      const { code: _code, ...rest } = a;
      localStorage.setItem(DRAFT_KEY, JSON.stringify(rest));
    } catch { /* ignore */ }
  }, [a, done]);

  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    window.scrollTo({ top: 0 });
    headingRef.current?.focus();
  }, [step, done]);

  const set = <K extends keyof RequestAnswers>(key: K, value: RequestAnswers[K]) => {
    setA((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };
  const toggle = (key: 'tools' | 'aiTools', value: string) =>
    setA((prev) => ({ ...prev, [key]: prev[key].includes(value) ? prev[key].filter((v) => v !== value) : [...prev[key], value] }));

  const showFirstError = () => requestAnimationFrame(() => document.querySelector('.err')?.scrollIntoView({ behavior: 'smooth', block: 'center' }));

  const next = () => {
    const e = validateStep(step, a);
    setErrors(e);
    if (Object.keys(e).length) return showFirstError();
    setStep((s) => Math.min(4, s + 1));
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (step < 4) return next(); // Enter key on earlier steps moves forward instead of sending
    const e = validateStep(4, a);
    setErrors(e);
    if (Object.keys(e).length) return showFirstError();
    setBusy(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...a, website }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; errors?: Errors; error?: string };
      if (res.ok && data.ok) {
        try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
        setDone(true);
        return;
      }
      if (data.errors && Object.keys(data.errors).length) {
        setErrors(data.errors);
        const firstStep = data.errors.industry || data.errors.size ? 1 : data.errors.role || data.errors.ai || data.errors.claude ? 2 : 4;
        setStep(firstStep);
        return;
      }
      setSubmitError(data.error || `Something went wrong. Please try again, or email ${contactEmail}.`);
    } catch {
      setSubmitError(`We couldn’t reach the site. Check your connection and try again, or email ${contactEmail}.`);
    } finally {
      setBusy(false);
    }
  };

  const chosen = sessions.find((s) => s.code === a.code);

  if (done) {
    const noClaude = a.claude === 'Not yet' || a.claude === 'Not sure';
    const industry = INDUSTRIES.find((i) => i.value === a.industry)?.label ?? '—';
    return (
      <div className="confirm">
        <div className="big-check"><Icon name="check" /></div>
        <h1 ref={headingRef} tabIndex={-1}>You’re in the queue.</h1>
        <p className="sub">
          {chosen
            ? `We review requests within ${reviewDays} business days and confirm your seat by email.`
            : 'You’ll be first to hear when new dates are posted. We’ll email you.'}
        </p>
        <div className="summary">
          <p className="kicker">Your request</p>
          <dl>
            <dt>Workshop</dt><dd>{chosen ? <>{chosen.title && <strong className="sum-title">{chosen.title}</strong>}{`${fDay(chosen.date)} · ${place(chosen)}`}</> : 'Any upcoming workshop'}</dd>
            <dt>Business</dt><dd>{industry}</dd>
            <dt>Team size</dt><dd>{a.size}</dd>
            <dt>Your role</dt><dd>{a.role}</dd>
            <dt>Claude today</dt><dd>{a.claude}</dd>
          </dl>
        </div>
        <div className="todo">
          <h3><Icon name="list-checks" /> {noClaude ? 'Nothing to do yet' : 'One thing to do now'}</h3>
          <p>
            {noClaude
              ? 'No Claude account yet? That’s fine. If you’re accepted, you’ll get setup steps before the day, including any promo code.'
              : 'Make sure you can sign in to Claude on your laptop. Use the desktop app if you can. The web version works too.'}
          </p>
        </div>
        <div className="confirm-actions">
          {chosen && (
            <a className="btn btn-dark btn-lg" href={`/api/calendar/${chosen.code}`} download>
              <Icon name="calendar-plus" /> Hold the date
            </a>
          )}
          <ShareButton url={siteUrl} title="Hands-on Claude workshops for business owners" />
        </div>
      </div>
    );
  }

  const aiNote = AI_STAGES.find((s) => s.label === a.ai);

  return (
    <form className="flow" onSubmit={submit} noValidate>
      <h1 className="sr-only" ref={headingRef} tabIndex={-1}>Request a seat, step {step} of 4: {STEP_NAMES[step]}</h1>
      <div className="flow-top">
        <span><span className="hide-sm">Request a seat · </span><b>Step {step} of 4</b></span>
        <span className="time">{TIME_LEFT[step]}</span>
      </div>
      <div className="progress" aria-hidden="true"><span style={{ width: `${step * 25}%` }} /></div>

      <div className="requesting">
        <Icon name="calendar-days" />
        <span>Requesting:</span>
        <label className="sr-only" htmlFor="code">Workshop</label>
        <select id="code" name="code" value={a.code} onChange={(e) => set('code', e.target.value)}>
          {sessions.map((s) => (
            <option key={s.code} value={s.code}>{[fDay(s.date), s.title, place(s)].filter(Boolean).join(' · ')}{s.full ? ' (waitlist)' : ''}</option>
          ))}
          <option value="any">Any upcoming workshop</option>
        </select>
      </div>
      {chosen?.title && (
        <div className="req-title">
          <h2>{chosen.title}</h2>
          <p>{fDay(chosen.date)} · {place(chosen)}</p>
        </div>
      )}
      {unknownCode && step === 1 && (
        <p className="notice"><Icon name="info" /> <span>That workshop isn’t taking requests anymore. Pick another one above, or choose “Any upcoming workshop.”</span></p>
      )}

      {step === 1 && (
        <>
          <fieldset className="q">
            <legend>What kind of business do you run?</legend>
            <div className="tiles">
              {INDUSTRIES.map((i) => (
                <div className="tile" key={i.value}>
                  <input type="radio" id={`industry-${i.value}`} name="industry" value={i.value} checked={a.industry === i.value} onChange={() => set('industry', i.value)} />
                  <label htmlFor={`industry-${i.value}`}><Icon name={i.icon} /><span>{i.label}</span></label>
                </div>
              ))}
            </div>
            <Err msg={errors.industry} />
          </fieldset>
          <fieldset className="q">
            <legend>How many people work there?</legend>
            <div className="chips">
              {SIZES.map((v, i) => (
                <span className="chip" key={v}>
                  <input type="radio" id={`size-${i}`} name="size" value={v} checked={a.size === v} onChange={() => set('size', v)} />
                  <label htmlFor={`size-${i}`}>{v}</label>
                </span>
              ))}
            </div>
            {sizeOutOfRange(a.size) && (
              <p className="note info"><Icon name="info" /><span>Workshops are built for teams of 5 to 500. Send your request anyway. If it’s not the right fit, we’ll point you somewhere better.</span></p>
            )}
            <Err msg={errors.size} />
          </fieldset>
        </>
      )}

      {step === 2 && (
        <>
          <fieldset className="q">
            <legend>What’s your role?</legend>
            <div className="chips">
              {ROLES.map((v, i) => (
                <span className="chip" key={v}>
                  <input type="radio" id={`role-${i}`} name="role" value={v} checked={a.role === v} onChange={() => set('role', v)} />
                  <label htmlFor={`role-${i}`}>{v}</label>
                </span>
              ))}
            </div>
            <Err msg={errors.role} />
          </fieldset>
          <fieldset className="q">
            <legend>Which sounds most like you today?</legend>
            <div className="choice-list">
              {AI_STAGES.map((s, i) => (
                <div className="choice" key={s.label}>
                  <input type="radio" id={`ai-${i}`} name="ai" value={s.label} checked={a.ai === s.label} onChange={() => set('ai', s.label)} />
                  <label htmlFor={`ai-${i}`}><span className="dot"><Icon name="check" /></span><span>{s.label}</span></label>
                </div>
              ))}
            </div>
            {aiNote && (aiNote.newToAi ? (
              <p className="note good"><Icon name="circle-check" /><span>Perfect. That’s exactly who this workshop is for. No prep needed.</span></p>
            ) : (
              <p className="note info"><Icon name="info" /><span>You’ll move fast. Heads-up: this workshop is built for people newer to AI, so we’ll check it’s a good fit.</span></p>
            ))}
            <Err msg={errors.ai} />
          </fieldset>
          <fieldset className="q">
            <legend>Do you have Claude today?</legend>
            <p className="hint">We ask early because getting access can take the longest.</p>
            <div className="chips">
              {CLAUDE_NOW.map((v, i) => (
                <span className="chip" key={v}>
                  <input type="radio" id={`claude-${i}`} name="claude" value={v} checked={a.claude === v} onChange={() => set('claude', v)} />
                  <label htmlFor={`claude-${i}`}>{v}</label>
                </span>
              ))}
            </div>
            <Err msg={errors.claude} />
          </fieldset>
        </>
      )}

      {step === 3 && (
        <>
          <fieldset className="q">
            <legend>Which tools does your business run on?</legend>
            <p className="hint">Pick all that apply.</p>
            <div className="chips">
              {BIZ_TOOLS.map((v, i) => (
                <span className="chip" key={v}>
                  <input type="checkbox" id={`tools-${i}`} name="tools" value={v} checked={a.tools.includes(v)} onChange={() => toggle('tools', v)} />
                  <label htmlFor={`tools-${i}`}><Icon name="check" className="ck" />{v}</label>
                </span>
              ))}
            </div>
          </fieldset>
          <fieldset className="q">
            <legend>Any AI tools you’ve tried?</legend>
            <p className="hint">Pick all that apply.</p>
            <div className="chips">
              {AI_TOOLS.map((v, i) => (
                <span className="chip" key={v}>
                  <input type="checkbox" id={`aitools-${i}`} name="aiTools" value={v} checked={a.aiTools.includes(v)} onChange={() => toggle('aiTools', v)} />
                  <label htmlFor={`aitools-${i}`}><Icon name="check" className="ck" />{v}</label>
                </span>
              ))}
            </div>
          </fieldset>
          <fieldset className="q">
            <legend>What’s the one task you’d hand off first? <span className="opt">Optional</span></legend>
            <p className="hint">Picture this week. The job you’d give away if you could.</p>
            <div className="chips">
              {FIRST_TASK.map((v, i) => (
                <span className="chip" key={v}>
                  <input type="radio" id={`task-${i}`} name="task" value={v} checked={a.task === v} onChange={() => set('task', v)} />
                  <label htmlFor={`task-${i}`}>{v}</label>
                </span>
              ))}
            </div>
          </fieldset>
        </>
      )}

      {step === 4 && (
        <>
          <fieldset className="q">
            <legend>Where should we reach you?</legend>
            <div className="fields">
              <div className="field"><label htmlFor="name">Your name</label><input id="name" name="name" autoComplete="name" value={a.name} onChange={(e) => set('name', e.target.value)} /></div>
              <div className="field"><label htmlFor="email">Work email</label><input id="email" name="email" type="email" autoComplete="email" inputMode="email" value={a.email} onChange={(e) => set('email', e.target.value)} /></div>
              <div className="field"><label htmlFor="company">Company</label><input id="company" name="company" autoComplete="organization" value={a.company} onChange={(e) => set('company', e.target.value)} /></div>
              <div className="field"><label htmlFor="phone">Phone (optional)</label><input id="phone" name="phone" type="tel" autoComplete="tel" value={a.phone} onChange={(e) => set('phone', e.target.value)} /></div>
            </div>
            <Err msg={errors.contact} />
          </fieldset>
          <label className="check" htmlFor="laptop">
            <input type="checkbox" id="laptop" name="laptop" checked={a.laptop} onChange={(e) => set('laptop', e.target.checked)} />
            <span><strong>I’ll bring a laptop and charger.</strong> A tablet won’t work for the exercises.</span>
          </label>
          <Err msg={errors.laptop} />
          <div className="q">
            <label className="legend" htmlFor="access">Anything that would make the day work better for you? <span className="opt">Optional</span></label>
            <p className="hint">For example, accessibility needs.</p>
            <textarea id="access" name="access" rows={3} value={a.access} onChange={(e) => set('access', e.target.value)} />
          </div>
          <div className="hp" aria-hidden="true">
            <label htmlFor="website">Leave this empty</label>
            <input id="website" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </div>
          <p className="privacy-line">
            <Icon name="lock" />
            <span>Your answers go to a confidential internal file. They’re never sold or shared and are only used for registration management. <a className="btn-link" href="/privacy">Privacy note</a></span>
          </p>
          {errors.code && <Err msg={errors.code} />}
          {submitError && <p className="notice error submit-error" role="alert"><Icon name="circle-alert" /> <span>{submitError}</span></p>}
        </>
      )}

      <div className="flow-nav">
        {step > 1 ? (
          <button type="button" className="btn-link" onClick={() => { setErrors({}); setStep((s) => s - 1); }}><Icon name="arrow-left" /> Back</button>
        ) : (
          <a className="btn-link" href="/#workshops"><Icon name="arrow-left" /> Workshops</a>
        )}
        {step < 4 ? (
          <button type="button" className="btn btn-primary" onClick={next}>Next: {STEP_NAMES[step + 1]} <Icon name="arrow-right" /></button>
        ) : (
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Sending…' : 'Send my request'} <Icon name="arrow-right" /></button>
        )}
      </div>
    </form>
  );
}
