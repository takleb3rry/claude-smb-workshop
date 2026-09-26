import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ClaudeMyCompany',
    short_name: 'ClaudeMyCo',
    description: 'Free, hands-on Claude workshops for business owners.',
    start_url: '/',
    display: 'browser',
    background_color: '#1C1917',
    theme_color: '#1C1917',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
