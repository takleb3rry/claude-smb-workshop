import Link from 'next/link';
import { dataMode, site } from '@/lib/config';
import { Icon } from './Icon';
import { Lockup } from './Logo';

/** Slim header for the request form, welcome pages and take-home track. */
export function MiniHeader({ backHref, backLabel }: { backHref: string; backLabel: string }) {
  return (
    <header className="site-header">
      <div className="wrap">
        <Link className="brand" href="/" aria-label="ClaudeMyCompany home"><Lockup /></Link>
        <Link className="back-link" href={backHref}>
          <Icon name="arrow-left" />
          <span className="bl-long">{backLabel}</span>
          <span className="bl-short">Back</span>
        </Link>
      </div>
    </header>
  );
}

export function Email() {
  return <a className="email" href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>;
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div>
          <Lockup size={30} />
          <p className="foot-blurb">
            Free, hands-on Claude workshops for owners and leaders of small and mid-sized businesses. Led by {site.trainer.name}, {site.trainer.credential}.
          </p>
        </div>
        <div>
          <h4>Workshops</h4>
          <ul>
            <li><Link href="/#workshops">Upcoming workshops</Link></li>
            <li><Link href="/#how">How the day works</Link></li>
            <li><Link href="/faq">All questions</Link></li>
          </ul>
        </div>
        <div>
          <h4>Contact</h4>
          <ul>
            <li><Email /></li>
            <li><Link href="/privacy">Privacy note</Link></li>
          </ul>
        </div>
        <p className="legal">
          Claude is a trademark of Anthropic, PBC. ClaudeMyCompany.com is run by {site.trainer.name}, an {site.trainer.credential}.
        </p>
      </div>
    </footer>
  );
}

/** Visible only when the site runs on sample data (local testing or a preview deployment). */
export function SampleRibbon() {
  if (dataMode() !== 'sample') return null;
  return <div className="sample-ribbon" role="note">Sample data: these workshops, codes and passwords are made up. Connect the Google Sheet to show real ones.</div>;
}
