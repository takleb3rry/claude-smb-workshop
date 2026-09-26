'use client';

import { useEffect, useState } from 'react';
import { Icon } from './Icon';

/** Copies text; falls back to selecting it when the clipboard is blocked. */
export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [state, setState] = useState<'idle' | 'done' | 'failed'>('idle');
  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState('done');
    } catch {
      setState('failed');
    }
    setTimeout(() => setState('idle'), 1800);
  };
  return (
    <button className="copy" type="button" onClick={onClick} aria-live="polite">
      <Icon name={state === 'done' ? 'check' : 'copy'} />
      {state === 'done' ? 'Copied' : state === 'failed' ? 'Select and copy' : label}
    </button>
  );
}

/** Per-visitor checklist on the welcome page. Ticks are remembered in this browser only. */
export function ReadyChecklist({ items, storageKey }: { items: string[]; storageKey: string }) {
  const [done, setDone] = useState<number[]>([]);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
      if (Array.isArray(saved)) setDone(saved.filter((n) => typeof n === 'number'));
    } catch { /* storage unavailable */ }
  }, [storageKey]);
  const toggle = (i: number) => {
    setDone((prev) => {
      const next = prev.includes(i) ? prev.filter((n) => n !== i) : [...prev, i];
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };
  return (
    <ul className="checklist">
      {items.map((t, i) => (
        <li key={t}>
          <label htmlFor={`rd-${i}`}>
            <input type="checkbox" id={`rd-${i}`} checked={done.includes(i)} onChange={() => toggle(i)} />
            <span>{t}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}

/** Uses the phone's share sheet when available, otherwise copies the link. */
export function ShareButton({ url, title }: { url: string; title: string }) {
  const [msg, setMsg] = useState('');
  const onClick = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setMsg('Link copied. Paste it in a message to another owner.');
    } catch {
      setMsg(`Share this link: ${url}`);
    }
  };
  return (
    <>
      <button className="btn-link" type="button" onClick={onClick}>Share with a fellow owner <Icon name="arrow-right" /></button>
      {msg && <p className="hint" role="status">{msg}</p>}
    </>
  );
}
