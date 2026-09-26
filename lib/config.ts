/**
 * Site-wide settings. Change these here; everything per workshop (city, date, venue,
 * links, passwords, promo codes, seats) comes from the Sessions tab of the Google Sheet.
 */
export type LogoOption = 'A' | 'B' | 'C';

export const site = {
  name: 'ClaudeMyCompany',
  url: (process.env.SITE_URL || 'https://www.claudemycompany.com').replace(/\/$/, ''),

  /** Logo mark: A = Play, B = Switch, C = Monogram (see components/Logo.tsx). */
  logo: 'A' as LogoOption,

  trainer: {
    name: 'Jeff Takle',
    initials: 'JT',
    /** Confirm this matches the exact wording Anthropic gave you. */
    credential: 'Approved Claude SMB Trainer',
    bio: 'I run small, hands-on workshops for owners and leaders who want Claude connected to their tools and handling real work in their business.',
    /** Put a square photo in /public (for example /jeff-takle.jpg) and set its path here. */
    photo: null as string | null,
  },

  contactEmail: 'claude@takle.me',

  hero: {
    eyebrow: 'Free · Hands-on · No coding needed',
    /** One line per entry. Wrap a word in *asterisks* to color it orange. */
    headline: ['Stop chatting with AI.', 'Start *building* with it.'],
    lede: 'A hands-on workshop for owners and leaders of 5-to-500-person businesses. Bring one real task. You’ll set Claude up on your own tools and turn that task into something that runs.',
  },

  /** Shown on the confirmation screen and in the FAQ. */
  reviewDays: 2,

  /** Workshop times in the sheet are read in this time zone unless a row sets its own. */
  defaultTimeZone: 'America/New_York',

  /** Course Step 3: the workshop app stays open for two weeks after the session. */
  windowDays: 14,

  /** Course Step 2: let guests arrive up to an hour before start. The day-of page opens then. */
  doorsOpenMinutes: 60,

  /** A session's seats bar turns orange when this share of seats (or less) is left. */
  lowSeatsShare: 0.25,
};

export type DataMode = 'sheet' | 'sample' | 'off';

/** sheet = live Google Sheet · sample = demo data (local/preview only) · off = nothing connected yet */
export function dataMode(): DataMode {
  if (process.env.APPS_SCRIPT_URL && process.env.APPS_SCRIPT_SECRET) return 'sheet';
  if (process.env.DATA_MODE === 'sample') return 'sample';
  return 'off';
}
