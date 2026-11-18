// Every section of the app, in desktop sidebar order. `rail` marks the tablet rail items.
import {
  Briefcase,
  Building2,
  ChartCandlestick,
  ClipboardCheck,
  FileUp,
  Gem,
  House,
  Settings,
  ShieldCheck,
  TrendingUp,
  UserCog,
} from 'lucide-react';

export const NAV_ITEMS = [
  { key: 'home', view: 'home', label: 'Home', icon: House, rail: true },
  { key: 'markets', view: 'markets', label: 'Markets', icon: TrendingUp, rail: true },
  { key: 'trade', view: 'trade', label: 'Trade', icon: ChartCandlestick, rail: true },
  { key: 'portfolio', view: 'portfolio', label: 'Portfolio', icon: Briefcase, rail: true },
  { key: 'listings', view: 'listings', label: 'Company listings', icon: Building2, rail: true },
  { key: 'issuer', view: 'issuer', label: 'List your company', icon: FileUp },
  { key: 'review', view: 'review', label: 'Review applications', icon: ClipboardCheck, role: 'reviewer' },
  { key: 'fund', view: 'fund', label: 'Gold & diamonds', icon: Gem },
  { key: 'info', view: 'info', label: 'Payments & security', icon: ShieldCheck },
  { key: 'account', view: 'account', label: 'Account', icon: UserCog },
  { key: 'settings', view: 'settings', label: 'Settings', icon: Settings },
];

// Items hidden from accounts without the item's role (the review screen is for reviewers only).
export const visibleItems = (items, user) => items.filter((item) => !item.role || user?.roles?.includes(item.role));

// Sections that are not on the tablet rail ("More" drawer).
export const TABLET_MORE = NAV_ITEMS.filter((item) => !item.rail);

export function isActive(item, view) {
  if (item.view === 'listings') return view === 'listings' || view === 'listing';
  return item.view === view;
}

// Phone tab bar destinations; everything else is in the "More" sheet.
export const MOBILE_TAB_VIEWS = ['home', 'markets', 'trade', 'listings'];
export const MOBILE_MORE = NAV_ITEMS.filter((item) => !MOBILE_TAB_VIEWS.includes(item.view));
