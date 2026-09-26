import {
  ArrowLeft, ArrowRight, BadgeCheck, BookCheck, BookOpen, Briefcase, Calculator, CalendarDays, CalendarPlus,
  Check, ChevronDown, CircleAlert, CircleCheck, ClipboardList, Clock, Copy, DoorOpen, Ellipsis, ExternalLink,
  Factory, Hammer, HardHat, HeartHandshake, HeartPulse, Info, KeyRound, Laptop, Lightbulb, ListChecks, ListOrdered,
  Lock, Mail, MapPin, Menu, MonitorPlay, PartyPopper, PhoneCall, Presentation, Receipt, Route, Scale, Share2,
  ShieldCheck, Store, Ticket, ToggleRight, TrendingUp, Trophy, UserRound, Utensils, Wifi, Wrench, X, Zap,
  type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  'arrow-left': ArrowLeft, 'arrow-right': ArrowRight, 'badge-check': BadgeCheck, 'book-check': BookCheck,
  'book-open': BookOpen, briefcase: Briefcase, calculator: Calculator, 'calendar-days': CalendarDays,
  'calendar-plus': CalendarPlus, check: Check, 'chevron-down': ChevronDown, 'circle-alert': CircleAlert,
  'circle-check': CircleCheck, 'clipboard-list': ClipboardList, clock: Clock, copy: Copy, 'door-open': DoorOpen,
  ellipsis: Ellipsis, 'external-link': ExternalLink, factory: Factory, hammer: Hammer, 'hard-hat': HardHat,
  'heart-handshake': HeartHandshake, 'heart-pulse': HeartPulse, info: Info, 'key-round': KeyRound, laptop: Laptop,
  lightbulb: Lightbulb, 'list-checks': ListChecks, 'list-ordered': ListOrdered, lock: Lock, mail: Mail,
  'map-pin': MapPin, menu: Menu, 'monitor-play': MonitorPlay, 'party-popper': PartyPopper, 'phone-call': PhoneCall,
  presentation: Presentation, receipt: Receipt, route: Route, scale: Scale, share: Share2, 'shield-check': ShieldCheck,
  store: Store, ticket: Ticket, 'toggle-right': ToggleRight, 'trending-up': TrendingUp, trophy: Trophy,
  'user-round': UserRound, utensils: Utensils, wifi: Wifi, wrench: Wrench, x: X, zap: Zap,
};

export function Icon({ name, className = '' }: { name: string; className?: string }) {
  const C = ICONS[name] ?? Info;
  return <C className={`i ${className}`.trim()} aria-hidden="true" focusable="false" strokeWidth={2} />;
}
