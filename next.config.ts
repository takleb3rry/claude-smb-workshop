import type { NextConfig } from 'next';

const noindex = [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      // Attendee pages are unlisted: keep them out of search engines.
      { source: '/welcome', headers: noindex },
      { source: '/welcome/:path*', headers: noindex },
      { source: '/resources', headers: noindex },
    ];
  },
  async redirects() {
    // Send the bare domain to www. (Vercel can also do this in the Domains settings.)
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'claudemycompany.com' }],
        destination: 'https://www.claudemycompany.com/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
