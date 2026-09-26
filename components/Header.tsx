'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Icon } from './Icon';
import { Lockup } from './Logo';

const NAV: [string, string][] = [
  ['What you’ll build', '/#build'],
  ['How it works', '/#how'],
  ['Is this for me?', '/#fit'],
  ['FAQ', '/#faq-home'],
];

export function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <header className="site-header">
      <div className="wrap">
        <Link className="brand" href="/" aria-label="ClaudeMyCompany home" onClick={close}>
          <Lockup />
        </Link>
        <nav className="nav" aria-label="Main">
          {NAV.map(([label, href]) => (
            <Link key={href} href={href}>{label}</Link>
          ))}
        </nav>
        <Link className="btn btn-primary btn-sm header-cta" href="/#workshops">Request a seat</Link>
        <button
          className="menu-btn" type="button" aria-expanded={open} aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((v) => !v)}
        >
          <Icon name={open ? 'x' : 'menu'} />
        </button>
      </div>
      {open && (
        <div className="mnav" id="mobile-nav">
          <div className="wrap">
            {NAV.map(([label, href]) => (
              <Link key={href} href={href} onClick={close}>{label}</Link>
            ))}
            <Link className="btn btn-primary" href="/#workshops" onClick={close}>Request a seat</Link>
          </div>
        </div>
      )}
    </header>
  );
}
