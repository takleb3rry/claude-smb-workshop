/** Answer choices for the request form. Shared by the browser form and the server check. */

export const INDUSTRIES: { value: string; label: string; icon: string }[] = [
  { value: 'trades', label: 'Trades & home services', icon: 'wrench' },
  { value: 'construction', label: 'Construction', icon: 'hard-hat' },
  { value: 'manufacturing', label: 'Manufacturing', icon: 'factory' },
  { value: 'accounting', label: 'Accounting & finance', icon: 'calculator' },
  { value: 'services', label: 'Professional services', icon: 'briefcase' },
  { value: 'retail', label: 'Retail & e-commerce', icon: 'store' },
  { value: 'health', label: 'Health & wellness', icon: 'heart-pulse' },
  { value: 'food', label: 'Food & hospitality', icon: 'utensils' },
  { value: 'other', label: 'Something else', icon: 'ellipsis' },
];

export const SIZES = ['Under 5', '5–20', '21–100', '101–500', '500+'];
/** Fit check: workshops are built for teams of 5–500. */
export const SIZES_IN_RANGE = ['5–20', '21–100', '101–500'];

export const ROLES = ['Owner or founder', 'CEO or president', 'Executive or senior leader', 'Manager', 'Team member'];
/** Fit check: owners and senior leaders. */
export const ROLES_FIT = ['Owner or founder', 'CEO or president', 'Executive or senior leader'];

/** Fit check: new to AI, not already automating or coding. */
export const AI_STAGES: { label: string; newToAi: boolean }[] = [
  { label: 'I’ve barely touched AI. Curious, a little skeptical.', newToAi: true },
  { label: 'I use ChatGPT or Claude for emails and ideas. That’s about it.', newToAi: true },
  { label: 'I’ve heard about “agents” and want to see one work.', newToAi: true },
  { label: 'My team already automates things. I want to go further.', newToAi: false },
  { label: 'I write code or build with AI tools myself.', newToAi: false },
];

/** Asked early because Claude access has the longest lead time (course Step 2). */
export const CLAUDE_NOW = ['Not yet', 'Free plan', 'Pro or Max', 'Team or Enterprise', 'Not sure'];

/** Tools owners already live in (deck slide 6) and the plugin's connectors (slide 29). */
export const BIZ_TOOLS = ['Gmail / Google Workspace', 'Outlook / Microsoft 365', 'QuickBooks', 'Excel or Google Sheets', 'HubSpot', 'Salesforce', 'Slack', 'Square, Stripe or PayPal', 'Something else'];

export const AI_TOOLS = ['ChatGPT', 'Claude', 'Microsoft Copilot', 'Google Gemini', 'None yet'];

/** Deck slide 6: #1 goal is to automate quoting, intake, follow-up and reporting. Slide 15: the one task you'd hand off first. */
export const FIRST_TASK = ['Quotes & estimates', 'Customer intake', 'Follow-ups', 'Invoices & collections', 'Reports', 'Scheduling', 'Email triage', 'Something else'];

export const STEP_NAMES = ['', 'your business', 'you and AI', 'your tools', 'how to reach you'];
export const TIME_LEFT = ['', 'about 60 sec left', 'about 45 sec left', 'about 30 sec left', 'about 20 sec left'];
