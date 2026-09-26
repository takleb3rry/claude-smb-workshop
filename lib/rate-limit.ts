/**
 * Best-effort limit on form posts per visitor. Serverless instances each keep their own
 * memory, so this only slows down repeated posts; the sheet script also skips exact duplicates.
 */
const hits = new Map<string, number[]>();

export function allow(key: string, max = 5, windowMs = 10 * 60_000): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return true;
}
