import Link from 'next/link';
import { Email, Footer } from '@/components/Chrome';
import { Header } from '@/components/Header';
import { Icon } from '@/components/Icon';

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="page-panel">
        <div className="narrow error-page">
          <h1>We couldn’t find that page.</h1>
          <p>If you followed a link from an email, it may be for a workshop that has ended. Questions? Email <Email />.</p>
          <Link className="btn btn-primary" href="/">Go to the homepage <Icon name="arrow-right" /></Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
