# ClaudeMyCompany.com

Sign-up site, welcome pages and take-home resources for Jeff Takle's free, hands-on Claude workshops for small and mid-sized business owners.

Built with Next.js 16 (App Router) and hosted on Vercel. Workshops and seat requests live in a Google Sheet, reached through a small Apps Script web app. Nothing about a single event is written into the code. City, date, venue, links, passwords and promo codes all come from the sheet.

## Pages

| Address | What it is | In search engines |
|---|---|---|
| `/` | Homepage: what you'll build, how the day works, data safety, "Is this for me?", upcoming workshops with seat bars, short FAQ | Yes |
| `/request/{code}` | Four-step request form (about 60 seconds, mostly buttons). `/request/any` means "any upcoming workshop". | Yes |
| `/welcome` | Front door for attendees. It lists the workshops that are live now and jumps straight to the page when only one is live. | No |
| `/welcome/{code}` | One page per workshop. It changes on its own: **before** (get ready, where, promo code) → **day of** (Wi-Fi, workshop link, cohort password, running order; opens 60 min before start) → **after** (14 days of take-home, survey, leaderboard) | No |
| `/resources` | Take-home track: every course step with prompts you can copy | No |
| `/faq` | All questions | Yes |
| `/privacy` | Privacy note | Yes |

Welcome pages have no login, which was your choice. They are kept out of search engines three ways: a robots meta tag, an `X-Robots-Tag` header and `robots.txt`. They are also left out of the menu and the sitemap.

**To preview a welcome page in any stage**, add `?preview=before`, `?preview=dayof` or `?preview=after` to its address. A small "Preview as" switch appears only in preview.

## How a workshop gets onto the site

1. Add a row to the **Sessions** tab of the sheet. Status **open** (or blank) shows it on the homepage.
2. The site checks the sheet every 60 seconds, so the row shows up within a minute.
3. Seat bars use `seats` and `accepted`. The bar turns orange at 25% of seats left. At 0 left, or with status **full**, the card switches to "Join the waitlist".

| Status | Homepage | Welcome page |
|---|---|---|
| open / blank | Listed | Yes |
| full / waitlist | Listed, waitlist button | Yes |
| closed | Hidden | Yes |
| cancelled | Hidden | Shows "Cancelled" |
| draft / hidden | Hidden | No (404) |

With no open workshops, the homepage says **"New dates coming soon"** and the request form still takes "next workshop" requests.

## Data modes

| Mode | When | What happens |
|---|---|---|
| `sheet` | `APPS_SCRIPT_URL` and `APPS_SCRIPT_SECRET` are set | Live workshops from the sheet. Requests are saved to the sheet and a receipt email goes out. |
| `off` | Nothing is set | "New dates coming soon". Sending the form shows "Requests open soon" with your email address (HTTP 503). This is the safe state before the sheet exists. |
| `sample` | `DATA_MODE=sample` | Made-up workshops dated from today, with a peach ribbon saying so. Requests are logged, not saved. **Use only locally or on preview deployments, never on the live site.** |

## Things you can change without touching layout

All in **`lib/config.ts`**:

- **Logo**: `logo: 'A' | 'B' | 'C'` (Play, Switch, Monogram). Then run `npm run icons` to rebuild the favicon, app icons and share image.
- **Headline**: `hero.headline`. One line per entry. Wrap a word in `*asterisks*` to color it orange.
- **Headshot**: put a square photo in `public/` (for example `public/jeff-takle.jpg`) and set `trainer.photo: '/jeff-takle.jpg'`. The initials circle is used until then.
- **Credential, bio, contact email, review time** (`reviewDays`), **time zone**, **after-workshop window** (`windowDays`) and **doors-open time** (`doorsOpenMinutes`).

Page copy lives in **`lib/content.ts`**. Every course fact there cites its step or deck slide in the SMB trainer corpus, which is the only source for course content. Add nothing that isn't in the corpus.

## Environment variables

Copy `.env.example` to `.env.local` for local work. On Vercel, set these under Project → Settings → Environment Variables.

| Name | Needed | Notes |
|---|---|---|
| `SITE_URL` | Yes | `https://www.claudemycompany.com` |
| `APPS_SCRIPT_URL` | For live data | Web-app URL from the sheet's Apps Script (step 3) |
| `APPS_SCRIPT_SECRET` | For live data | Shared key. It never reaches the browser. |
| `DATA_MODE` | No | `sample` for local or preview only |

**This repository is public. Never commit a `.env` file, a secret, a cohort password or a promo code.** Those belong in the sheet or in Vercel.

## Run it

```bash
npm install
cp .env.example .env.local        # then set DATA_MODE=sample to see demo workshops
npm run dev                        # http://localhost:3000
```

## Test it

```bash
npm run typecheck
npm test                           # unit tests: times, stages, seat math, validation, calendar file
npm run build && npm run test:e2e  # browser tests on desktop and phone, with accessibility checks
```

The browser tests start two copies of the built site: one on sample data (port 3100) and one with nothing connected (port 3101). They run on desktop Chrome and a Pixel 7 profile and check:

- every page
- the whole request flow
- the API
- all three welcome-page stages
- phone layout
- accessibility (axe)

On a new machine, run `npx playwright install chromium` once.

## Deploy (Vercel)

1. Import `Takleb3rry/claude-smb-workshop` in Vercel. The framework is detected as Next.js, so no settings are needed.
2. Add the environment variables above to **Production**. Leave `DATA_MODE` empty there.
3. Under Domains, add `www.claudemycompany.com` as the primary domain and `claudemycompany.com` as a redirect to it. The app also redirects the bare domain to `www`.

## Sheet contract (for the Apps Script)

**Read workshops**: `GET {APPS_SCRIPT_URL}?action=sessions&key={SECRET}` must return:

```json
{ "ok": true, "sessions": [ {
  "code": "", "status": "open", "date": "2026-10-15", "start": "09:00", "end": "12:30",
  "timezone": "America/New_York", "format": "In person", "city": "Easthampton, MA",
  "venue": "", "room": "", "address": "", "mapUrl": "", "parking": "",
  "seats": 20, "accepted": 0,
  "workshopLink": "", "cohortPassword": "", "wifiName": "", "wifiPassword": "",
  "promoCode": "", "promoUnlocks": "", "promoRedeem": "", "promoExpires": "", "surveyLink": ""
} ] }
```

- Times are `HH:MM`, 24-hour clock.
- A blank `code` becomes `{date}-{city}`, for example `2026-10-15-easthampton`. The code is the workshop's address, so don't change it once people have the link.
- `format` containing online, Zoom, Teams, virtual or remote marks the workshop as online.
- Private fields (Wi-Fi details, workshop link, cohort password and promo code) appear only on that workshop's welcome page. They never appear on the homepage, in the form or in the page data sent to the browser.

**Save a request**: `POST {APPS_SCRIPT_URL}` with:

```json
{ "action": "request", "key": "SECRET", "request": {
  "submittedAt": "ISO time", "code": "2026-10-15-easthampton or any",
  "industry": "", "size": "", "role": "", "ai": "", "claude": "", "tools": [], "aiTools": [], "task": "",
  "name": "", "email": "", "company": "", "phone": "", "laptop": true, "access": "",
  "fit": { "role": true, "size": true, "ai": true, "score": 3 }
} }
```

The script appends a row, sends the receipt email with Reply-To `claude@takle.me`, and returns `{ "ok": true }`. The site checks every answer before sending. It also blocks bots with a hidden field and limits repeat submissions.

## Project layout

```
app/          pages, API routes (request, calendar file), icons, robots, sitemap
components/   header/footer, homepage blocks, request flow, copy buttons
lib/          config, copy, sheet reader, time and stage logic, validation, calendar file
scripts/      make-icons.mjs (favicon set and share image from the logo option)
tests/        unit (Vitest) and e2e (Playwright + axe)
```

Fonts are Inter and Source Sans 3 (SIL Open Font License, in `app/fonts`). The code is under the MIT license. Claude is a trademark of Anthropic, PBC.
