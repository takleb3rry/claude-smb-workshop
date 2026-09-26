import type { Metadata } from 'next';
import Link from 'next/link';
import { FaqItem } from '@/components/Blocks';
import { Email, Footer } from '@/components/Chrome';
import { Header } from '@/components/Header';
import { Icon } from '@/components/Icon';
import { FAQ } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Questions',
  description: 'Cost, who it’s for, what to bring, data safety and what happens after the workshop.',
};

export default function FaqPage() {
  return (
    <>
      <Header />
      <main id="main" className="page-panel">
        <div className="page-head">
          <div className="narrow">
            <p className="eyebrow">Questions</p>
            <h1>Everything you might ask before you sign up</h1>
          </div>
        </div>
        <div className="narrow" style={{ paddingBottom: 24 }}>
          {FAQ.map((g) => (
            <section key={g.g} className="faq-group">
              <h2>{g.g}</h2>
              <div className="faq-list">{g.items.map((it) => <FaqItem key={it.q} q={it.q} a={it.a} />)}</div>
            </section>
          ))}
          <div className="empty" style={{ marginTop: 44 }}>
            <h3>Still wondering?</h3>
            <p>Email <Email /> and Jeff will get back to you.</p>
            <Link className="btn btn-primary" href="/#workshops">Pick a workshop <Icon name="arrow-right" /></Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
