/**
 * Builds the favicon set and the share image from the logo option in lib/config.ts.
 *   npm run icons            (uses the option set in lib/config.ts)
 *   npm run icons -- B       (preview another option)
 * Writes: app/icon.svg, app/favicon.ico, app/apple-icon.png, app/opengraph-image.png,
 *         public/icon-192.png, public/icon-512.png
 * Needs a Chromium that Playwright can launch (npx playwright install chromium on a new machine).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const root = new URL('..', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');
const write = (p, data) => writeFileSync(new URL(p, root), data);

const option = process.argv[2] || (read('lib/config.ts').match(/logo:\s*'([ABC])'/) || [])[1] || 'A';
const logoSrc = read('components/Logo.tsx');
const glyph = (logoSrc.match(new RegExp(`${option}: '([^']+)'`)) || [])[1];
if (!glyph) throw new Error(`No glyph for logo option ${option}`);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="15" fill="#E8590C"/>${glyph}</svg>`;
write('app/icon.svg', svg + '\n');

const font = (p) => readFileSync(new URL(p, root)).toString('base64');
const inter = font('app/fonts/Inter-latin-var.woff2');
const source = font('app/fonts/SourceSans3-latin-var.woff2');

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });

async function png(size, pad = 0, bg = 'transparent') {
  await page.setViewportSize({ width: size, height: size });
  const inner = size - pad * 2;
  await page.setContent(`<html><body style="margin:0;background:${bg};display:grid;place-items:center;width:${size}px;height:${size}px">
    <div style="width:${inner}px;height:${inner}px">${svg.replace('<svg ', `<svg width="${inner}" height="${inner}" `)}</div></body></html>`);
  return page.screenshot({ omitBackground: bg === 'transparent', clip: { x: 0, y: 0, width: size, height: size } });
}

const p16 = await png(16), p32 = await png(32), p48 = await png(48);
write('app/apple-icon.png', await png(180, 18, '#1C1917'));
write('public/icon-192.png', await png(192, 16, '#1C1917'));
write('public/icon-512.png', await png(512, 44, '#1C1917'));

// favicon.ico with PNG entries (16, 32, 48)
const entries = [[16, p16], [32, p32], [48, p48]];
const header = Buffer.alloc(6 + 16 * entries.length);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(entries.length, 4);
let offset = header.length;
entries.forEach(([size, data], i) => {
  const o = 6 + i * 16;
  header.writeUInt8(size, o); header.writeUInt8(size, o + 1); header.writeUInt8(0, o + 2); header.writeUInt8(0, o + 3);
  header.writeUInt16LE(1, o + 4); header.writeUInt16LE(32, o + 6);
  header.writeUInt32LE(data.length, o + 8); header.writeUInt32LE(offset, o + 12);
  offset += data.length;
});
write('app/favicon.ico', Buffer.concat([header, ...entries.map(([, d]) => d)]));

// Share image (1200 × 630)
await page.setViewportSize({ width: 1200, height: 630 });
await page.setContent(`<html><head><style>
  @font-face{font-family:Inter;src:url(data:font/woff2;base64,${inter}) format('woff2');font-weight:100 900}
  @font-face{font-family:Source;src:url(data:font/woff2;base64,${source}) format('woff2');font-weight:200 900}
  body{margin:0;width:1200px;height:630px;background:#1C1917;color:#fff;font-family:Inter,Arial,sans-serif;display:flex;flex-direction:column;justify-content:space-between;padding:72px 80px;box-sizing:border-box}
  .lock{display:flex;align-items:center;gap:18px;font-weight:800;font-size:40px;letter-spacing:-0.02em}
  .lock b{color:#E8590C}
  h1{font-size:76px;line-height:1.04;letter-spacing:-0.035em;margin:0;font-weight:800;max-width:980px}
  h1 em{font-style:normal;color:#E8590C}
  .row{display:flex;justify-content:space-between;align-items:center;font-family:Source,Arial,sans-serif;font-size:30px;color:#D6D3D1}
  .pill{background:#2E2A26;color:#FDBA74;font-family:Inter,Arial,sans-serif;font-weight:700;font-size:22px;letter-spacing:.14em;text-transform:uppercase;padding:14px 24px;border-radius:999px}
</style></head><body>
  <div class="lock">${svg.replace('<svg ', '<svg width="64" height="64" ')}<span>Claude<b>My</b>Company</span></div>
  <h1>Hands-on Claude workshops for <em>business owners</em></h1>
  <div class="row"><span class="pill">Free · Hands-on · No coding needed</span><span>claudemycompany.com</span></div>
</body></html>`);
write('app/opengraph-image.png', await page.screenshot({ clip: { x: 0, y: 0, width: 1200, height: 630 } }));

await browser.close();
console.log(`Icons and share image written for logo option ${option}.`);
