import type { Metadata } from 'next';
import { Footer, MiniHeader, SampleRibbon } from '@/components/Chrome';
import { RequestFlow } from '@/components/RequestFlow';
import { site } from '@/lib/config';
import { loadSessions, toPublic, upcomingPublic } from '@/lib/sessions';

export const metadata: Metadata = {
  title: 'Request a seat',
  description: 'Four quick steps, about a minute. Workshops are free; seats are limited and confirmed by email.',
};

export default async function RequestPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const now = new Date();
  const { sessions } = await loadSessions(now);
  const list = upcomingPublic(sessions, now).map(toPublic);
  const known = code === 'any' || list.some((s) => s.code === code);
  return (
    <>
      <SampleRibbon />
      <MiniHeader backHref="/#workshops" backLabel="Back to workshops" />
      <main id="main" className="page-panel">
        <RequestFlow
          sessions={list}
          initialCode={known ? code : list[0]?.code ?? 'any'}
          unknownCode={!known}
          reviewDays={site.reviewDays}
          contactEmail={site.contactEmail}
          siteUrl={site.url}
        />
      </main>
      <Footer />
    </>
  );
}
