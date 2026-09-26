import { site, type LogoOption } from '@/lib/config';

/** Glyphs for the three approved logo options (white on an orange rounded square). */
export const LOGO_GLYPHS: Record<LogoOption, string> = {
  A: '<path d="M25 19.6v24.8c0 1.7 1.9 2.7 3.3 1.8l18.6-12.4c1.3-.8 1.3-2.7 0-3.6L28.3 17.8c-1.4-.9-3.3.1-3.3 1.8z" fill="#fff"/>',
  B: '<rect x="11" y="20.5" width="42" height="23" rx="11.5" fill="#fff"/><circle cx="41.5" cy="32" r="8" fill="#E8590C"/>',
  C: '<path d="M42.9 21.1A15.4 15.4 0 1 0 42.9 42.9" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/><path d="M29 25.6v12.8c0 .9 1 1.4 1.7.9l9.5-6.4c.7-.5.7-1.4 0-1.9l-9.5-6.3c-.7-.5-1.7 0-1.7.9z" fill="#fff"/>',
};

export function markSvg(option: LogoOption = site.logo): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="15" fill="#E8590C"/>${LOGO_GLYPHS[option]}</svg>`;
}

export function Mark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <rect width="64" height="64" rx="15" fill="#E8590C" />
      <g dangerouslySetInnerHTML={{ __html: LOGO_GLYPHS[site.logo] }} />
    </svg>
  );
}

export function Lockup({ tone = 'on-dark', size = 34 }: { tone?: 'on-dark' | 'on-light'; size?: number }) {
  return (
    <span className={`lockup ${tone}`}>
      <Mark size={size} />
      <span className="wordmark">Claude<b>My</b>Company</span>
    </span>
  );
}
