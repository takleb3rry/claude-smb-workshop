import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const OFF = 'http://127.0.0.1:3101';

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  return errors;
}

async function firstSessionCode(page: Page, index = 0) {
  await page.goto('/');
  const href = await page.locator('#workshops .session a').nth(index).getAttribute('href');
  return (href ?? '').split('/').pop() as string;
}

async function noHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
}

test.describe('homepage', () => {
  test('shows the hero, trainer card and sample workshops with seat bars', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Start building with');
    await expect(page.locator('.sample-ribbon')).toBeVisible();
    await expect(page.locator('.trainer-card')).toContainText('Jeff Takle');
    await expect(page.locator('.trainer-card')).toContainText('Approved Claude SMB Trainer');
    await expect(page.locator('#workshops .session')).toHaveCount(4);
    const workshops = page.locator('#workshops');
    await expect(workshops).toContainText('8 of 20 seats left');
    await expect(workshops).toContainText('4 of 20 seats left');
    await expect(workshops).toContainText('Full · join the waitlist');
    await expect(workshops.getByRole('link', { name: 'Join the waitlist' })).toBeVisible();
    await expect(page.locator('footer')).toContainText('claude@takle.me');
    expect(errors).toEqual([]);
  });

  test('workshop cards lead with the title, and untitled ones look unchanged', async ({ page }) => {
    await page.goto('/');
    const titled = page.locator('#workshops .session').filter({ hasText: 'Claude for Nonprofits' });
    await expect(titled.locator('h3.s-title')).toHaveText('Claude for Nonprofits');
    await expect(titled.locator('.s-where')).toContainText('Holyoke, MA');
    // The untitled sample keeps today's layout: place in the heading, no title element.
    const untitled = page.locator('#workshops .session').filter({ hasText: 'Easthampton, MA' });
    await expect(untitled.locator('h3')).toHaveText(/Easthampton, MA/);
    await expect(untitled.locator('.s-title')).toHaveCount(0);
    // Hero trainer card names the next workshop.
    await expect(page.locator('.trainer-card .tc-title')).toHaveText('Claude for Nonprofits');
  });

  test('follows the copy rules', async ({ page }) => {
    await page.goto('/');
    const text = await page.locator('main').innerText();
    expect(text).not.toMatch(/by application|not just chatting|instead of chat|That’s chatting|10-city|1,000 owners/i);
    await expect(page.locator('#before-after .case')).toHaveCount(2);
    await expect(page.locator('#build .build-card')).toHaveCount(6);
    await expect(page.locator('#safe')).toContainText('Not used for training');
  });

  test('shows "coming soon" when no workshops are posted', async ({ page }) => {
    await page.goto('/?demo=empty');
    await expect(page.locator('#workshops')).toContainText('New dates coming soon.');
    await expect(page.locator('.trainer-card')).toContainText('Next dates coming soon');
    await expect(page.locator('#workshops').getByRole('link', { name: /Save my spot/ })).toHaveAttribute('href', '/request/any');
  });

  test('with nothing connected, shows "coming soon" and no sample ribbon', async ({ page }) => {
    await page.goto(OFF + '/');
    await expect(page.locator('#workshops')).toContainText('New dates coming soon.');
    await expect(page.locator('.sample-ribbon')).toHaveCount(0);
  });

  test('has no serious accessibility problems', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`)).toEqual([]);
  });
});

test.describe('request a seat', () => {
  test('checks each step and sends the request', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/');
    await page.locator('#workshops .session').nth(1).getByRole('link', { name: 'Request a seat' }).click();
    await expect(page).toHaveURL(/\/request\//);
    await expect(page.locator('.flow-top')).toContainText('Step 1 of 4');

    await page.getByRole('button', { name: /Next: you and AI/ }).click();
    await expect(page.locator('.err')).toHaveCount(2);
    await page.locator('label[for="industry-trades"]').click();
    await page.locator('label[for="size-0"]').click();
    await expect(page.locator('.note.info')).toContainText('built for teams of 5 to 500');
    await page.locator('label[for="size-2"]').click();
    await page.getByRole('button', { name: /Next: you and AI/ }).click();

    await expect(page.locator('.flow-top')).toContainText('Step 2 of 4');
    await page.locator('label[for="role-0"]').click();
    await page.locator('label[for="ai-1"]').click();
    await expect(page.locator('.note.good')).toBeVisible();
    await page.locator('label[for="claude-2"]').click();
    await page.getByRole('button', { name: /Next: your tools/ }).click();

    await expect(page.locator('.flow-top')).toContainText('Step 3 of 4');
    await page.locator('label[for="tools-2"]').click();
    await page.locator('label[for="task-3"]').click();
    await page.getByRole('button', { name: /Next: how to reach you/ }).click();

    await expect(page.locator('.flow-top')).toContainText('Step 4 of 4');
    await page.getByRole('button', { name: /Send my request/ }).click();
    await expect(page.locator('.err')).toHaveCount(2);
    await page.getByLabel('Your name').fill('Pat Lopez');
    await page.getByLabel('Work email').fill('pat@example.com');
    await page.getByLabel('Company', { exact: true }).fill('Lopez Heating');
    await page.locator('label[for="laptop"]').click();
    const [resp] = await Promise.all([
      page.waitForResponse('**/api/request'),
      page.getByRole('button', { name: /Send my request/ }).click(),
    ]);
    expect(resp.status()).toBe(200);
    await expect(page.getByRole('heading', { name: 'You’re in the queue.' })).toBeVisible();
    await expect(page.locator('.summary')).toContainText('Trades & home services');
    await expect(page.locator('.summary')).toContainText('21–100');
    await expect(page.getByRole('link', { name: /Hold the date/ })).toHaveAttribute('href', /\/api\/calendar\//);
    expect(errors).toEqual([]);
  });

  test('names the chosen workshop in the header, picker and confirmation', async ({ page }) => {
    const code = await firstSessionCode(page);
    await page.goto(`/request/${code}`);
    await expect(page.locator('.req-title h2')).toHaveText('Claude for Nonprofits');
    await expect(page.locator('.req-title p')).toContainText('Holyoke, MA');
    const picked = await page.locator('#code option').first().innerText();
    expect(picked).toContain('Claude for Nonprofits');
    expect(picked).toContain('Holyoke, MA');
  });

  test('"any upcoming workshop" path', async ({ page }) => {
    await page.goto('/request/any');
    await expect(page.locator('#code')).toHaveValue('any');
    await expect(page.locator('.notice')).toHaveCount(0);
  });

  test('an old workshop link falls back with a note', async ({ page }) => {
    await page.goto('/request/2020-01-01-nowhere');
    await expect(page.locator('.notice')).toContainText('isn’t taking requests anymore');
  });

  test('the form has no serious accessibility problems', async ({ page }) => {
    await page.goto('/request/any');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([]);
  });
});

test.describe('request API', () => {
  const valid = {
    code: 'any', industry: 'trades', size: '21–100', role: 'Owner or founder',
    ai: 'I use ChatGPT or Claude for emails and ideas. That’s about it.', claude: 'Pro or Max',
    tools: ['QuickBooks'], aiTools: [], task: '', name: 'Pat', email: 'pat@example.com', company: 'Lopez Heating',
    phone: '', laptop: true, access: '',
  };

  test('rejects missing answers', async ({ request }) => {
    const r = await request.post('/api/request', { data: { code: 'any' } });
    expect(r.status()).toBe(400);
    const j = await r.json();
    expect(j.errors.industry).toBeTruthy();
    expect(j.errors.laptop).toBeTruthy();
  });

  test('accepts a valid request on sample data', async ({ request }) => {
    const r = await request.post('/api/request', { data: valid, headers: { 'x-forwarded-for': '10.0.0.1' } });
    expect(r.status()).toBe(200);
    expect(await r.json()).toMatchObject({ ok: true, sample: true });
  });

  test('quietly drops spam-trap posts', async ({ request }) => {
    const r = await request.post('/api/request', { data: { ...valid, website: 'http://spam.example' } });
    expect(await r.json()).toEqual({ ok: true });
  });

  test('says requests open soon when nothing is connected', async ({ request }) => {
    const r = await request.post(OFF + '/api/request', { data: valid, headers: { 'x-forwarded-for': '10.0.0.2' } });
    expect(r.status()).toBe(503);
    expect((await r.json()).error).toContain('claude@takle.me');
  });

  test('serves a hold-the-date calendar file', async ({ page, request }) => {
    const code = await firstSessionCode(page);
    const r = await request.get(`/api/calendar/${code}`);
    expect(r.status()).toBe(200);
    expect(r.headers()['content-type']).toContain('text/calendar');
    const body = await r.text();
    expect(body).toContain('BEGIN:VEVENT');
    expect(body).toContain('STATUS:TENTATIVE');
    expect(body).toContain('SEQUENCE:0');
    expect(body).toContain('SUMMARY:Claude for Nonprofits (requested)');
    expect(body).not.toContain('/welcome/');
    expect((await request.get('/api/calendar/nope')).status()).toBe(404);
  });

  test('serves the confirmed calendar file at ?confirmed=1', async ({ page, request }) => {
    const code = await firstSessionCode(page);
    const r = await request.get(`/api/calendar/${code}?confirmed=1`);
    expect(r.status()).toBe(200);
    expect(r.headers()['content-type']).toContain('text/calendar');
    const body = await r.text();
    expect(body).toContain('STATUS:CONFIRMED');
    expect(body).toContain('SEQUENCE:1');
    expect(body).toContain('SUMMARY:Claude for Nonprofits');
    expect(body).toContain(`/welcome/${code}`);
    expect(body).toContain('Bring a laptop and a charger.');
    // Same UID as the hold, so calendars replace it instead of duplicating.
    const hold = await (await request.get(`/api/calendar/${code}`)).text();
    const uid = (s: string) => /^UID:.*$/m.exec(s)?.[0];
    expect(uid(body)).toBe(uid(hold));
  });
});

test.describe('welcome pages', () => {
  test('front door groups live workshops and stays out of search', async ({ page }) => {
    const res = await page.goto('/welcome');
    expect(res?.headers()['x-robots-tag']).toContain('noindex');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    await expect(page.getByRole('heading', { name: 'Coming up' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Recently finished' })).toBeVisible();
    await expect(page.locator('.hub-card')).toHaveCount(2);
    await expect(page.locator('.hub-card h3').first()).toHaveText('Claude for Nonprofits');
  });

  test('the welcome hero leads with the workshop title', async ({ page }) => {
    const code = await firstSessionCode(page);
    await page.goto(`/welcome/${code}`);
    await expect(page.locator('.portal-title')).toHaveText('Claude for Nonprofits');
    // The stage heading stays the H1.
    await expect(page.getByRole('heading', { level: 1 })).toContainText('You’re all set for');
    await expect(page).toHaveTitle(/^Claude for Nonprofits · Welcome/);
  });

  test('a workshop page moves through before, day of and after', async ({ page }) => {
    const errors = watchErrors(page);
    const code = await firstSessionCode(page);
    await page.goto(`/welcome/${code}`);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('You’re all set for');
    await expect(page.getByRole('heading', { name: /When and where/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Your promo code/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Workshop link and password/ })).toBeVisible();
    await expect(page.locator('.runorder li')).toHaveCount(6);
    await expect(page.locator('.stage-switch')).toHaveCount(0);

    await page.goto(`/welcome/${code}?preview=dayof`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Welcome. Let’s get you signed in.');
    await expect(page.getByRole('link', { name: /Open the workshop app/ })).toHaveAttribute('href', /workshop\.example\.com/);
    await expect(page.locator('.secret.huge .val')).toContainText('sample-2026');
    await expect(page.locator('.now-tag')).toHaveCount(1);
    await expect(page.locator('.stage-switch a')).toHaveCount(3);

    await page.goto(`/welcome/${code}?preview=after`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Nice work. Keep going.');
    await expect(page.locator('.after-banner')).toContainText('9 days left');
    await expect(page.getByRole('link', { name: /Open the take-home track/ })).toHaveAttribute('href', '/resources');
    expect(errors).toEqual([]);
  });

  test('the get-ready checklist remembers ticks in this browser', async ({ page }) => {
    const code = await firstSessionCode(page);
    await page.goto(`/welcome/${code}`);
    await page.locator('label[for="rd-0"]').click();
    await page.reload();
    await expect(page.locator('#rd-0')).toBeChecked();
  });

  test('day-of page has no serious accessibility problems', async ({ page }) => {
    const code = await firstSessionCode(page);
    await page.goto(`/welcome/${code}?preview=dayof`);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([]);
  });

  test('unknown workshop codes show the not-found page', async ({ page }) => {
    const res = await page.goto('/welcome/not-a-real-workshop');
    expect(res?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('We couldn’t find that page.');
  });
});

test.describe('other pages and files', () => {
  test('take-home track', async ({ page }) => {
    await page.goto('/resources');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    await expect(page.locator('.res-step')).toHaveCount(9);
    await expect(page.locator('.prompt .copy').first()).toBeVisible();
  });

  test('FAQ opens answers', async ({ page }) => {
    await page.goto('/faq');
    await page.getByText('What does it cost?').click();
    await expect(page.getByText('Nothing, and there is no catch.')).toBeVisible();
    await expect(page.locator('main')).toContainText('Anthropic sponsors the “Claude SMB Trainer” program');
  });

  test('FAQ carries the workshop-email wording', async ({ page }) => {
    await page.goto('/faq');
    const main = page.locator('main');
    await expect(main).toContainText('it’s safest to bring a backup Gmail account');
    await expect(main).toContainText('Cowork is available on the Pro and Max plans');
    await expect(main).toContainText('vouchers for a free month of Max');
    await expect(main).not.toContainText('spare account will be ready');
    // The answers live in collapsed <details>, so open this one before looking for its link.
    await page.getByText('Desktop app or web?').click();
    const dl = main.getByRole('link', { name: 'https://claude.com/download' }).first();
    await expect(dl).toHaveAttribute('href', 'https://claude.com/download');
    await expect(dl).toHaveAttribute('target', '_blank');
  });

  test('privacy note', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.locator('main')).toContainText('confidential internal file');
    await expect(page.locator('main')).toContainText('claude@takle.me');
  });

  test('private workshop details stay off public pages', async ({ request }) => {
    for (const path of ['/', '/request/any', '/welcome', '/faq']) {
      const html = await (await request.get(path)).text();
      expect(html, path).not.toMatch(/sample-wifi|-sample-2026|SAMPLE-CODE|workshop\.example\.com|CommunityRoom-Guest/);
    }
  });

  test('every other page has no serious accessibility problems', async ({ page }) => {
    const code = await firstSessionCode(page);
    for (const path of ['/?demo=empty', '/welcome', `/welcome/${code}?preview=before`, `/welcome/${code}?preview=after`, '/resources', '/faq', '/privacy', '/not-a-page']) {
      await page.goto(path);
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id), path).toEqual([]);
    }
  });

  test('robots, sitemap, icons and share image', async ({ request }) => {
    const robots = await (await request.get('/robots.txt')).text();
    expect(robots).toContain('Disallow: /welcome');
    const sitemap = await (await request.get('/sitemap.xml')).text();
    expect(sitemap).toContain('/faq');
    expect(sitemap).not.toContain('/welcome');
    for (const [path, type] of [['/icon.svg', 'image/svg+xml'], ['/favicon.ico', 'image/'], ['/apple-icon.png', 'image/png'], ['/opengraph-image.png', 'image/png'], ['/manifest.webmanifest', 'json']]) {
      const r = await request.get(path);
      expect(r.status(), path).toBe(200);
      expect(r.headers()['content-type'], path).toContain(type);
    }
  });
});

test.describe('phone layout', () => {
  test('pages fit the screen and the menu opens', async ({ page }, info) => {
    test.skip(info.project.name !== 'phone', 'phone only');
    await page.goto('/');
    await noHorizontalScroll(page);
    await page.getByRole('button', { name: 'Open menu' }).click();
    await expect(page.locator('#mobile-nav')).toBeVisible();
    await page.goto('/request/any');
    await noHorizontalScroll(page);
    const code = await firstSessionCode(page);
    await page.goto(`/welcome/${code}?preview=dayof`);
    await noHorizontalScroll(page);
    await page.goto('/resources');
    await noHorizontalScroll(page);
  });
});
