import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { site } from '@/lib/config';
import './globals.css';

const inter = localFont({
  src: './fonts/Inter-latin-var.woff2',
  variable: '--font-inter',
  weight: '100 900',
  display: 'swap',
});

const sourceSans = localFont({
  src: [
    { path: './fonts/SourceSans3-latin-var.woff2', style: 'normal', weight: '200 900' },
    { path: './fonts/SourceSans3-latin-var-italic.woff2', style: 'italic', weight: '200 900' },
  ],
  variable: '--font-source-sans',
  display: 'swap',
});

const description = 'Free, hands-on workshops where owners and leaders of 5-to-500-person businesses set Claude up on their own tools and turn one real task into something that runs.';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: 'ClaudeMyCompany · Hands-on Claude workshops for business owners', template: '%s · ClaudeMyCompany' },
  description,
  applicationName: 'ClaudeMyCompany',
  openGraph: {
    type: 'website',
    siteName: 'ClaudeMyCompany',
    title: 'Hands-on Claude workshops for business owners',
    description,
    url: site.url,
  },
  twitter: { card: 'summary_large_image', title: 'Hands-on Claude workshops for business owners', description },
};

export const viewport: Viewport = {
  themeColor: '#1C1917',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceSans.variable}`}>
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
