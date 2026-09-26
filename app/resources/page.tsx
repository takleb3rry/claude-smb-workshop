import type { Metadata } from 'next';
import { MiniHeader } from '@/components/Chrome';
import { Icon } from '@/components/Icon';
import { CopyButton } from '@/components/Interactive';
import { GLOSSARY, KEEP, MOVES, POWER_MOVES, TAKEHOME } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Take-home track',
  description: 'Every step from the workshop, with prompts you can copy.',
  robots: { index: false, follow: false },
};

export default function Resources() {
  return (
    <>
      <MiniHeader backHref="/welcome" backLabel="Your welcome page" />
      <main id="main" className="page-panel">
        <div className="page-head">
          <div className="narrow">
            <p className="eyebrow">Take-home track</p>
            <h1>Keep building at your own pace.</h1>
            <p>Every step from the workshop, with prompts you can copy. Work through them in order.</p>
          </div>
        </div>
        <div className="narrow portal">
          <section className="pcard">
            <h2><Icon name="route" /> The pattern behind every build</h2>
            <div className="res-intro">
              {MOVES.map((m) => <div key={m.n} className="move"><b>{m.n}</b><strong>{m.t}</strong><p>{m.p}</p></div>)}
            </div>
          </section>

          <section className="pcard">
            <h2><Icon name="list-ordered" /> Your steps</h2>
            <div className="res-steps">
              {TAKEHOME.map((t, i) => (
                <div key={t.n} className="res-step">
                  <p className="n">{i + 1} · {t.n}</p>
                  <h3>{t.h}</h3>
                  <p>{t.p}</p>
                  {t.prompt && <div className="prompt"><CopyButton text={t.prompt} /><code>{t.prompt}</code></div>}
                  <ol className="how-list">{t.how.map((h) => <li key={h}>{h}</li>)}</ol>
                </div>
              ))}
            </div>
          </section>

          <section className="pcard">
            <h2><Icon name="zap" /> Four power moves</h2>
            <p>When the output is “fine but not great,” reach for one of these.</p>
            {POWER_MOVES.map((p) => (
              <div key={p.t} className="prompt"><CopyButton text={p.p} /><code><strong>{p.t}:</strong> {p.p}</code></div>
            ))}
          </section>

          <section className="pcard">
            <h2><Icon name="scale" /> What to give AI, what to keep</h2>
            <div className="keep">
              <div className="k1"><h3>Hand it off</h3><ul>{KEEP.handOff.map((x) => <li key={x}>{x}</li>)}</ul></div>
              <div className="k2"><h3>Supervise</h3><ul>{KEEP.supervise.map((x) => <li key={x}>{x}</li>)}</ul></div>
              <div className="k3"><h3>Keep it</h3><ul>{KEEP.keep.map((x) => <li key={x}>{x}</li>)}</ul></div>
            </div>
          </section>

          <section className="pcard">
            <h2><Icon name="book-open" /> Words you’ll hear</h2>
            <dl className="gloss">{GLOSSARY.map((g) => <div key={g.t} style={{ display: 'contents' }}><dt>{g.t}</dt><dd>{g.d}</dd></div>)}</dl>
          </section>
        </div>
      </main>
    </>
  );
}
