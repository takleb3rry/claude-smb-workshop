export type SessionStatus = 'open' | 'full' | 'closed' | 'draft' | 'cancelled';
export type SessionFormat = 'in-person' | 'online';

/** One workshop = one row of the Sessions tab. */
export interface Session {
  code: string;
  status: SessionStatus;
  date: string; // YYYY-MM-DD
  start: string; // HH:MM (24h)
  end: string; // HH:MM (24h)
  timeZone: string;
  format: SessionFormat;
  city: string;
  venue: string;
  room: string;
  address: string;
  mapUrl: string;
  parking: string;
  seats: number;
  accepted: number;
  // Attendee-only details (shown on the unlisted welcome pages)
  workshopLink: string;
  cohortPassword: string;
  wifiName: string;
  wifiPassword: string;
  promoCode: string;
  promoUnlocks: string;
  promoRedeem: string;
  promoExpires: string;
  surveyLink: string;
}

/** The public subset that is safe to send to the browser (request form, cards). */
export interface PublicSession {
  code: string;
  date: string;
  start: string;
  end: string;
  timeZone: string;
  format: SessionFormat;
  city: string;
  venue: string;
  room: string;
  seats: number;
  accepted: number;
  full: boolean;
}

export type Stage = 'before' | 'dayof' | 'after' | 'ended';

export interface RequestAnswers {
  code: string; // session code or "any"
  industry: string;
  size: string;
  role: string;
  ai: string;
  claude: string;
  tools: string[];
  aiTools: string[];
  task: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  laptop: boolean;
  access: string;
}

export interface FitFlags {
  role: boolean;
  size: boolean;
  ai: boolean;
  score: number;
}
