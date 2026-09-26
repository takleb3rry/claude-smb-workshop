import type { Metadata } from 'next';
import { Email, Footer } from '@/components/Chrome';
import { Header } from '@/components/Header';
import { PRIVACY_ROWS } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Privacy note',
  description: 'What happens to the answers in your workshop request.',
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main id="main" className="page-panel">
        <div className="page-head">
          <div className="narrow">
            <p className="eyebrow">Privacy note</p>
            <h1>What happens to your answers</h1>
            <p>Plain language, short.</p>
          </div>
        </div>
        <div className="narrow portal">
          <section className="pcard">
            <dl className="kv" style={{ gridTemplateColumns: '160px minmax(0,1fr)' }}>
              {PRIVACY_ROWS.map((r) => (
                <div key={r.t} style={{ display: 'contents' }}>
                  <dt>{r.t}</dt><dd style={{ fontWeight: 400, color: 'var(--text)' }}>{r.d}</dd>
                </div>
              ))}
              <dt>Your choice</dt>
              <dd style={{ fontWeight: 400, color: 'var(--text)' }}>Email <Email /> to see, correct or delete your information.</dd>
            </dl>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
