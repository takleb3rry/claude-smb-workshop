/**
 * Page copy. Course facts come only from smb-trainer-corpus-2026-09-26.md; each block notes its source.
 * Copy rules (Jeff): never knock chatting with Claude, no taglines, plain headings.
 */
import { site } from './config';

export const BUILDS = [ /* src: deck slide 30 (descriptions), slide 29 (command names) */
  { name: 'Monday Brief', cmd: '/monday-brief', icon: 'calendar-days', desc: 'Cash, sales, pipeline, the week ahead, and your top 3 to-dos — every Monday at 7am.', tools: 'QuickBooks · PayPal · HubSpot · Calendar' },
  { name: 'Cash-Flow Snapshot', cmd: '/cash-flow-snapshot', icon: 'trending-up', desc: '30/60/90-day cash forecast with confidence bands and named risk flags. From QuickBooks + payments.', tools: 'QuickBooks · Square · Stripe' },
  { name: 'Invoice Chaser', cmd: '/invoice-chase', icon: 'receipt', desc: 'Drafts overdue-invoice reminders matched to each customer’s payment history. Sends via PayPal with your approval.', tools: 'QuickBooks · PayPal · Gmail' },
  { name: 'Month-End Close', cmd: '/close-month', icon: 'book-check', desc: 'Reconciles QuickBooks against payment processors, flags gaps, and writes the P&L narrative.', tools: 'QuickBooks · PayPal · Stripe' },
  { name: 'Lead Triage', cmd: '/lead-triage', icon: 'phone-call', desc: 'Scores inbound leads, drafts touch emails, and blocks calendar time for the top 5.', tools: 'HubSpot · Gmail · Calendar' },
  { name: 'Customer Pulse Check', cmd: '/customer-pulse-check', icon: 'heart-handshake', desc: 'Feedback themes from reviews, tickets, and disputes — with ready-to-send response templates.', tools: 'PayPal · HubSpot · reviews' },
];

/** Example output only; the numbers are samples. */
export const BRIEF_EXAMPLE = {
  kpis: [
    { value: '$48.2k', label: 'cash on hand', tone: '' },
    { value: '+11%', label: 'sales vs last week', tone: 'up' },
    { value: '3', label: 'invoices 30+ days late', tone: 'warn' },
  ],
  top3: [
    { text: 'Chase Harbor Dental — $6,400, 41 days late (draft ready)', ok: false },
    { text: 'Call back Riverside Landscaping — quoted Tue, no reply', ok: false },
    { text: 'Payroll Fri: covered with $9.1k margin', ok: true },
  ],
};

export const CASES = [ /* src: deck slides 19 and 18 (the deck labels the split "AI" and "Corey" / "Owner") */
  {
    job: 'Paying the bills', who: 'Corey, Prospect Butcher Co.', where: 'Brooklyn · 2 locations · ~30 vendors · 2 billing systems',
    before: '2–3 scattered evening hours a week. Invoices across two systems. Some weeks vendors just waited.',
    after: '45 focused minutes on Monday: a snapshot, then vendor-by-vendor suggestions with the reasoning shown. Vendors get paid consistently now.',
    ai: 'Pulls invoices, scans email, computes cash, recommends', keeps: 'Corey keeps', owner: 'Every payment decision and every vendor conversation',
    quote: 'Paying bills wasn’t on the calendar — it followed me home.',
  },
  {
    job: 'The daily order report', who: 'A regional distributor', where: 'Daily order reports across many accounts, each in its own format',
    before: 'Every afternoon, someone downloaded order PDFs from account emails and re-keyed the line items into Excel, in each account’s own layout.',
    after: 'A scheduled job pulls the PDFs, rebuilds each account’s format and compiles the report before the team is back from lunch.',
    ai: 'Pulls the PDFs, parses line items, rebuilds each account’s format, compiles', keeps: 'The owner keeps', owner: 'Anything that looks off, and the exceptions',
    quote: 'Someone on my team spent every afternoon turning order PDFs into spreadsheets. Now a scheduled job does it before they’re back from lunch.',
  },
];

export const DAY = [ /* src: Step 4 Overview + deck slide 5 (~60 min); Step 5; Steps 8–10; Steps 11–14; Step 6; Steps 2–3 */
  { icon: 'presentation', t: 'The mental model', p: 'About an hour on working with AI like a brilliant new hire, and the 4Ds: Delegation, Description, Discernment and Diligence.' },
  { icon: 'monitor-play', t: 'Watch it work', p: 'A 5–10 minute live demo of the Claude for Small Business plugin, run on a practice business.' },
  { icon: 'user-round', t: 'Set Claude up for you', p: 'Tell Claude who you are and how you like to work. Then connect Gmail or Google Calendar.' },
  { icon: 'wrench', t: 'Build, step by step', p: 'Add a plugin, create your first skill, turn your data into a live report, and give Claude your business context.' },
  { icon: 'hammer', t: 'Open build', p: 'Pick a real task from your business and build it while we work the room. A few people demo at the end.' },
  { icon: 'party-popper', t: 'Keep going at home', p: 'The workshop app stays open for two weeks, with a take-home track and resources.', done: true },
];

export const SAFE = [ /* src: deck slide 22 */
  { icon: 'lock', t: 'Not used for training', p: 'Anthropic doesn’t train its models on your business content. You own what goes in, and what comes out. On a Team plan, that’s the default.' },
  { icon: 'shield-check', t: 'Encrypted & isolated', p: 'Encrypted end to end, walled off from every other company, never sold, deletable on request.' },
  { icon: 'badge-check', t: 'Independently audited', p: 'SOC 2 & ISO 27001 — audited yearly by outside firms. All public at trust.anthropic.com.' },
];

export const CONTROL = [ /* src: Step 10 Implement (permissions) */
  { t: 'Read access', p: 'Claude can look at your data but can’t change anything.' },
  { t: 'Write access', p: 'Claude can take action, and always requires your approval first.' },
  { t: 'Your off switch', p: 'Toggle access, revoke it entirely, or adjust scope anytime.' },
];

export const OBJECTIONS = [ /* src: deck slides 10, 28; Step 10 + slide 29; Step 2 (one week out); Steps 2–3 */
  { q: '“I’m not technical.”', a: 'Good. It’s not technical. It’s a management skill, and you already have it. You describe the job in plain English, the way you’d brief a smart new hire. No coding.' },
  { q: '“I don’t want AI touching my books.”', a: 'You decide what each connection can do. Read access can look but can’t change anything. Write access always asks for your approval first, and you can switch any connection off at any time. You approve every step that touches money or customers.', dark: true },
  { q: '“What do I need to bring?”', a: 'A laptop and charger. A tablet won’t work for the exercises. A week before, you’ll get the setup steps: use the Claude desktop app if you can, and sign in before you arrive.' },
  { q: '“What happens after?”', a: 'The workshop app stays open for two weeks. Your welcome page becomes home base: the take-home track, the resources, and the leaderboard.' },
];

export interface FaqGroup { g: string; items: { q: string; a: string[] }[] }

export const FAQ: FaqGroup[] = [
  { g: 'The workshop', items: [
    { q: 'What does it cost?', a: ['Nothing. Workshops are free. Seats are limited, so you request one and we confirm by email.'] },
    { q: 'Who is it for?', a: ['Owners and senior leaders of businesses with 5 to 500 people who are new to AI and want to connect Claude to the tools they already use.'] },
    { q: 'Do I need to be technical?', a: ['No. It’s not technical. It’s a management skill, and you already have it. You describe what you need in plain English, the way you’d brief a smart new hire.'] }, /* src: deck slides 10, 28 */
    { q: 'What will I leave with?', a: ['Three things: an approach to AI fluency (the 4D framework and power moves that work on any model), an AI workflow (a real thing, on a real problem from your business, that takes input and produces output), and the confidence to execute.'] }, /* src: deck slide 5 */
    { q: 'How long is it?', a: ['Each workshop lists its start and finish time. Doors open up to an hour early so you can settle in and get connected.'] }, /* src: Step 2 */
  ]},
  { g: 'Requests', items: [
    { q: 'Why do I have to send a request?', a: ['Seats are limited so everyone gets help at their own laptop. Jeff reviews each request to make sure the workshop fits where you are.'] },
    { q: 'What happens after I send a request?', a: [`You’ll get an email confirming we received it. We review requests within ${site.reviewDays} business days and confirm your seat by email.`] },
    { q: 'No dates near me yet. Can I still sign up?', a: ['Yes. Choose “Any upcoming workshop” and you’ll be first to hear when new dates are posted.'] },
  ]},
  { g: 'Before you come', items: [ /* src: Step 2 (one week out) */
    { q: 'What should I bring?', a: ['A laptop and a charger. A tablet will not work for the exercises.'] },
    { q: 'Do I need a Claude account?', a: ['Tell us in your request whether you have one. If you’re accepted, you’ll get setup steps before the day, including any promo code and where to enter it.'] },
    { q: 'Desktop app or web?', a: ['Use the desktop app if you can. It’s the fuller experience. The web version works too. Sign in before you arrive, not on the day.'] },
    { q: 'My work email is locked down by IT.', a: ['Locked-down work email may not connect. A spare account will be ready so you can keep going.'] },
  ]},
  { g: 'Your data', items: [ /* src: deck slides 22, 23; Step 10 */
    { q: 'Is my business data safe?', a: ['From Anthropic’s workshop deck: “We don’t train our models on your business content. You own what goes in — and what comes out.” Data is encrypted end to end, walled off from every other company, never sold, and deletable on request. Anthropic is audited yearly for SOC 2 and ISO 27001; details are public at trust.anthropic.com.', 'Start on a Team plan and that’s the default.'] },
    { q: 'Can Claude change things without asking?', a: ['Not if you don’t let it. Read access can look but can’t change anything. Write access always requires your approval first. You can toggle access, revoke it entirely, or adjust scope anytime.'] },
    { q: 'What shouldn’t I hand to AI?', a: ['Keep final pricing, contracts and legal, anything sent unread to a customer, hiring and firing decisions, and numbers you’d certify to the bank.'] },
  ]},
  { g: 'After the workshop', items: [ /* src: Steps 2–3 */
    { q: 'What happens after?', a: ['The workshop app stays open for two weeks. Your welcome page becomes home base: the take-home track, the resources, and the leaderboard.'] },
  ]},
];

/** Four questions shown on the homepage. */
export const HOME_FAQ: [string, number][] = [['The workshop', 0], ['Requests', 1], ['Before you come', 0], ['The workshop', 2]];

/** Course Step 2, Welcome Portal tab + One week out. */
export const GET_READY = [
  'Get the Claude desktop app if you can. The web version works too.',
  'Sign in before you arrive, not on the day.',
  'Check you can reach Cowork now. Some accounts and devices don’t have it yet.',
  'Pack your laptop and charger. A tablet won’t work for the exercises.',
  'Using a locked-down work email? It may not connect. A spare account will be ready.',
];

/** Course Step 10 watch-out; Step 2 (spare account); Step 2 Room tab (neighbours help each other). */
export const STUCK_TIPS = [
  'Sign-in pop-ups often open behind the app. If nothing happens, look behind your window.',
  'Work email locked down by IT? Ask for the spare account and keep going.',
  'Ask your table first. Neighbours often know the next click. Then raise a hand.',
];

/** Running order. src: Step 2 (arrive up to an hour early), deck slide 5 (~60 min), Step 5 (5–10 min), Step 6 (open build, demos). */
export function runOrder(start: string, end: string, addMinutes: (t: string, m: number) => string) {
  return [
    { at: addMinutes(start, -site.doorsOpenMinutes), title: 'Doors open', note: 'Grab a seat, plug in, and join the Wi-Fi.' },
    { at: start, title: 'Opening talk', note: 'About an hour on the mental model and the 4Ds.' },
    { at: addMinutes(start, 60), title: 'Live demo', note: '5–10 minutes of the Small Business plugin, running live.' },
    { at: addMinutes(start, 70), title: 'Hands-on workshop', note: 'Set Claude up for you and build, step by step.' },
    { at: addMinutes(end, -50), title: 'Open build and demos', note: 'Build your own task. A few people show theirs.' },
    { at: end, title: 'Wrap', note: 'What happens next.' },
  ];
}

export const TAKEHOME = [ /* src: Implement tabs, Steps 8–16 (prompts verbatim) */
  { n: 'Global Instructions', h: 'Tell Claude who you are', p: 'Global Instructions are the bio Claude reads at the start of every conversation. Set them once and Claude knows who you are every time.',
    prompt: 'Help me write my Global Instructions for Claude. Interview me — ask me about my role, my business, how I like to communicate, and what I care about. Then draft a short set of instructions I can paste into my settings.',
    how: ['Copy the draft', 'Click your profile icon (bottom-left), then Settings, then Profile', 'Paste into the Global Instructions box and click Save', 'Test it in a new chat: “What do you know about me and my work?”'] },
  { n: 'Cowork Instructions', h: 'Set your ground rules', p: 'Global Instructions tell Claude who you are. Cowork Instructions tell Claude how to act when it’s working on your computer.',
    prompt: 'How I like you to work:\n- Always show a short plan and wait for my approval before taking any action.\n- Never delete files or send anything without checking with me first.\n- When in doubt, ask instead of assuming.\n\nMy preferences:\n- When booking flights, avoid overnight layovers.\n- When booking restaurants, I prefer Chinese and Italian — and I have a tree-nut allergy.\n- Keep summaries short and to the point.',
    how: ['Click your profile icon (bottom-left) → Settings → Cowork', 'Paste your instructions into the Cowork Instructions field', 'Click Save', 'Test it: “Plan a dinner for next Friday night and find me 3 recommended restaurants.”'] },
  { n: 'Connectors', h: 'Connect one tool', p: 'Connectors are how Claude talks to your work tools. Gmail or Google Calendar are great starting points.',
    prompt: 'What are my most recent emails about? Summarize the top 5.',
    how: ['In Claude Desktop, go to the Integrations page from the side menu', 'Click Gmail or Google Calendar and follow the authorization flow', 'Look for the green checkmark', 'Or try: “What does my schedule look like this week? Any conflicts I should know about?”'] },
  { n: 'Plugins', h: 'Install a plugin', p: 'Plugins are bundles of related skills and connectors, packaged for a role. One or two that match your actual work beat ten you never touch.',
    prompt: '',
    how: ['Open the Claude desktop app and go to the Home tab', 'Click the + button in the bottom-left corner of the chat window', 'Select Add plugin to open the plugin directory', 'Pick one that matches your role and click Add'] },
  { n: 'Skills', h: 'Create your first skill', p: 'Pick one task you repeat every week and turn it into a skill. If you do it more than twice a month, it’s a skill.',
    prompt: '',
    how: ['Go to Customize → Skills → Create Skill → Create with Claude', 'Describe the task in plain English: what goes in, what should come out, what “good” looks like', 'Answer Claude’s follow-up questions and save it with a clear name', 'Run it with “/”. Not quite right? Say “update the skill so this doesn’t happen again.”'] },
  { n: 'Artifacts', h: 'Turn data into an artifact', p: 'Pick one connector you already have set up and ask Claude to visualize the data in it.',
    prompt: 'Look at my calendar for the next two weeks and build me a simple artifact showing how my time is split across meetings, focus time, and everything else.',
    how: ['Keep it current: “Update this artifact with the latest data from my calendar.”', 'Team plan: share it directly with teammates', 'Individual plan: download it and send it like any file'] },
  { n: 'Projects', h: 'Create a project and add context', p: 'A project is a folder with a memory. Everything inside it carries forward across conversations.',
    prompt: 'Draft a Business Context document for this project based on everything you know about me and my work.',
    how: ['In Claude Desktop, click Projects in the sidebar → Create Project', 'Click Add Content and create a document called “Business Context”', 'Write 3–5 paragraphs: what your team does, your tools, current priorities'] },
  { n: 'Bonus · Scheduled tasks', h: 'Schedule your weekly rhythm', p: 'Scheduled tasks run on a rhythm you set. They still ask before they send or change anything.',
    prompt: 'Schedule my briefing to run every weekday at 7am. Check my calendar, my overnight emails, and my messages. Flag anything urgent and give me a top-3 priority list I can scan with coffee.',
    how: ['Your computer needs to be on for local scheduled tasks to run'] },
  { n: 'Bonus · CLAUDE.md', h: 'Set up your files for better results', p: 'A CLAUDE.md is a short note at the top of a folder that tells Claude how you want it to behave there.',
    prompt: 'Look at how I have this folder organized and write a CLAUDE.md that explains it — how you should behave here, what to never touch without asking, my naming and filing preferences, and anything you should always do.',
    how: ['Test it: “Find the most recent contract for my biggest client and tell me when it expires.”'] },
];

export const MOVES = [ /* src: deck slide 17 */
  { n: '01', t: 'Map the task', p: 'Write down the steps you do by hand. Where does the time actually go?' },
  { n: '02', t: 'Delegate the parts', p: 'Which steps go to AI, which stay with you. Draw the line on purpose.' },
  { n: '03', t: 'Describe the brief', p: 'Output, audience, style, behavior. Brief it like a new hire.' },
  { n: '04', t: 'Verify vs. truth', p: 'Run it on work you’ve already done. Trust only what you’ve checked.' },
];

export const POWER_MOVES = [ /* src: deck slide 21 */
  { t: 'Think first', p: 'Before you answer, think step-by-step about what I’m actually asking.' },
  { t: 'Meta-prompt', p: 'What questions should I be asking you to get a better output?' },
  { t: 'Ask for three', p: 'Give me three different approaches, then tell me which you’d pick and why.' },
  { t: 'Show an example', p: 'Here’s one I wrote that worked — match this voice.' },
];

export const KEEP = { /* src: deck slide 23 */
  handOff: ['Drafting: emails, posts, SOPs, JDs', 'Summarizing docs, notes, threads', 'Gathering data across sources', 'Reformatting and cleaning data', 'First-pass research'],
  supervise: ['Customer-facing comms', 'Reports you’ll send externally', 'Anything with numbers in it', 'Multi-step workflows'],
  keep: ['Final pricing, contracts, legal', 'Anything sent unread to a customer', 'Hiring and firing decisions', 'Numbers you’d certify to the bank'],
};

export const GLOSSARY = [ /* src: Terminology tabs */
  { t: 'Skill', d: 'A task you have taught Claude once so you never have to explain it again.' },
  { t: 'Command', d: 'How you run a skill. Type a slash in the message box and pick the one you want.' },
  { t: 'Connector', d: 'Permission for Claude to reach one of your tools, like Gmail or your calendar. You choose whether it can only look, or also take action.' },
  { t: 'Plugin', d: 'A folder of related skills that someone else already built and packaged up.' },
  { t: 'Project', d: 'A folder with a memory. Everything you put in it stays available to every conversation inside it.' },
  { t: 'Artifact', d: 'A finished thing Claude produces that you can open, edit, download, and send.' },
  { t: 'Scheduled task', d: 'A job that runs on its own on a rhythm you set. It still asks before it sends or changes anything.' },
];

export const PRIVACY_ROWS = [
  { t: 'What we collect', d: 'The answers in your request (business type, team size, your role, AI experience, tools) and your contact details.' },
  { t: 'Why', d: 'To review requests, plan each workshop around the people in the room, and send you workshop details.' },
  { t: 'Where it’s kept', d: 'In a confidential internal file. This data is never sold or shared and is only used for registration management.' },
  { t: 'Emails you’ll get', d: 'A confirmation that we received your request, a decision, and details for your workshop.' },
];
