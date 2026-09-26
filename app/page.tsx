import Link from 'next/link';
import { BriefCard, CaseCard, FaqItem, Headline, SessionCard, TrainerCard } from '@/components/Blocks';
import { Footer, SampleRibbon } from '@/components/Chrome';
import { Header } from '@/components/Header';
import { Icon } from '@/components/Icon';
import { dataMode, site } from '@/lib/config';
import { BUILDS, CASES, CONTROL, DAY, FAQ, HOME_FAQ, OBJECTIONS, SAFE } from '@/lib/content';
import { loadSessions, upcomingPublic } from '@/lib/sessions';

export const revalidate = 60;

export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const now = new Date();
  const { sessions } = await loadSessions(now);
  // Sample mode only: /?demo=empty shows the "coming soon" state.
  const list = dataMode() === 'sample' && params.demo === 'empty' ? [] : upcomingPublic(sessions, now);
  const next = list[0];

  return (
    <>
      <SampleRibbon />
      <Header />
      <main id="main">
        <section className="hero">
          <div className="wrap hero-grid">
            <div>
              <p className="eyebrow-pill">{site.hero.eyebrow}</p>
              <h1><Headline lines={site.hero.headline} /></h1>
              <p className="lede">{site.hero.lede}</p>
              <div className="cta-row">
                <Link className="btn btn-primary btn-lg" href="#workshops">Pick a workshop <Icon name="arrow-right" /></Link>
                <Link className="btn btn-outline-dark btn-lg" href="#how">How the day works</Link>
              </div>
              <p className="encourage">
                <Icon name="circle-check" />
                <span><strong>You can do this.</strong> It’s not technical. It’s a management skill, and you already have it.</span>
              </p>
            </div>
            <TrainerCard next={next} />
          </div>
        </section>

        <section className="band" id="before-after">
          <div className="wrap">
            <p className="eyebrow">Before and after</p>
            <h2>What changed for two business owners</h2>
            <p className="sub">Both examples come from Anthropic’s SMB workshop deck.</p>
            <div className="cases">{CASES.map((c) => <CaseCard key={c.who} c={c} />)}</div>
          </div>
        </section>

        <section className="band band-panel" id="build">
          <div className="wrap">
            <div className="build-head">
              <div>
                <p className="eyebrow">What you’ll build</p>
                <h2>Six workflows to start from</h2>
                <p className="sub">Each one comes ready-made in the Claude for Small Business plugin. Start from one, or build your own from a task you do every week.</p>
              </div>
              <BriefCard />
            </div>
            <div className="builds">
              {BUILDS.map((b) => (
                <article key={b.name} className="build-card">
                  <div className="bc-head">
                    <span className="ico"><Icon name={b.icon} /></span>
                    <div><h3>{b.name}</h3><p className="cmd">{b.cmd}</p></div>
                  </div>
                  <p>{b.desc}</p>
                  <p className="tools">{b.tools}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="band" id="how">
          <div className="wrap how-grid">
            <div className="how-side">
              <p className="eyebrow">How the day works</p>
              <h2>What happens at the workshop</h2>
              <p className="sub">Everyone works on their own laptop. You do the typing. I point at the screen and name the next click.</p>
              <div className="bring">
                <span className="ico"><Icon name="laptop" /></span>
                <p><strong>Bring a laptop and charger.</strong> A tablet won’t work for the exercises. You’ll get setup steps a week before.</p>
              </div>
            </div>
            <ol className="timeline">
              {DAY.map((s, i) => (
                <li key={s.t} className={s.done ? 'done' : undefined}>
                  <span className="ico"><Icon name={s.icon} /></span>
                  <div><p className="tl-step">Step {i + 1}</p><h3>{s.t}</h3><p>{s.p}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="band band-dark" id="safe">
          <div className="wrap">
            <p className="eyebrow">Safety first</p>
            <h2>Is your business data safe with Claude?</h2>
            <div className="safe-grid">
              {SAFE.map((s) => (
                <div key={s.t} className="safe-card"><span className="ico"><Icon name={s.icon} /></span><h3>{s.t}</h3><p>{s.p}</p></div>
              ))}
            </div>
            <h3 className="control-title">And you stay in control</h3>
            <div className="control">
              {CONTROL.map((c) => (
                <div key={c.t}><h4><Icon name="toggle-right" /> {c.t}</h4><p>{c.p}</p></div>
              ))}
            </div>
          </div>
        </section>

        <section className="band" id="fit">
          <div className="wrap">
            <p className="eyebrow">Is this for me?</p>
            <h2>Four questions owners ask before they sign up</h2>
            <div className="objections">
              {OBJECTIONS.map((o) => (
                <div key={o.q} className={`obj ${o.dark ? 'dark' : ''}`.trim()}>
                  <h3><Icon name={o.dark ? 'shield-check' : 'circle-check'} /> {o.q}</h3>
                  <p>{o.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="band band-panel" id="workshops">
          <div className="wrap">
            <p className="eyebrow">Upcoming workshops</p>
            <h2>Pick a workshop</h2>
            <p className="sub">Free, limited seating. Everyone gets help at their own laptop, and we confirm each seat by email.</p>
            {list.length ? (
              <div className="sessions">{list.map((s, i) => <SessionCard key={s.code} s={s} soon={i === 0} />)}</div>
            ) : (
              <div className="empty">
                <span className="ico"><Icon name="calendar-days" /></span>
                <h3>New dates coming soon.</h3>
                <p>Tell us about your business (it takes about 2 minutes) and you’ll be first to hear when a workshop opens.</p>
                <Link className="btn btn-primary btn-lg" href="/request/any">Save my spot for the next one <Icon name="arrow-right" /></Link>
              </div>
            )}
          </div>
        </section>

        <section className="band" id="faq-home">
          <div className="wrap">
            <p className="eyebrow">Questions</p>
            <h2>Quick answers</h2>
            <div className="faq-list">
              {HOME_FAQ.map(([g, idx]) => {
                const it = FAQ.find((x) => x.g === g)!.items[idx];
                return <FaqItem key={it.q} q={it.q} a={it.a} />;
              })}
            </div>
            <p className="more"><Link className="btn-link" href="/faq">See all questions <Icon name="arrow-right" /></Link></p>
          </div>
        </section>

        <section className="closing">
          <div className="wrap">
            <div><h2>Request a seat</h2><p>Free. Bring one task and a laptop.</p></div>
            <Link className="btn btn-primary btn-lg" href="#workshops">Pick a workshop <Icon name="arrow-right" /></Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
