import { Fragment } from 'react';

/**
 * Renders copy that carries a link, so content strings stay plain text.
 * Two forms: [label](https://example.com) for custom wording, and a bare
 * https:// URL, which becomes its own link. Trailing sentence punctuation
 * stays outside the link. Pure function, so client components can use it too.
 */
const PATTERN = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<]*[^\s<.,;:!?)\]])/g;

export function RichText({ text }: { text: string }) {
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  PATTERN.lastIndex = 0;
  while ((m = PATTERN.exec(text)) !== null) {
    if (m.index > last) out.push(<Fragment key={`t${last}`}>{text.slice(last, m.index)}</Fragment>);
    const href = m[2] ?? m[3];
    const label = m[1] ?? m[3];
    out.push(
      <a key={`l${m.index}`} className="email" href={href} target="_blank" rel="noopener noreferrer">{label}</a>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(<Fragment key={`t${last}`}>{text.slice(last)}</Fragment>);
  return <>{out}</>;
}
