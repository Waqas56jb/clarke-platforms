// Every section of the app, in desktop sidebar order. `rail` is the position on the tablet rail.
import {
  Bookmark,
  Clapperboard,
  Crown,
  Heart,
  House,
  MessageCircle,
  Music,
  Newspaper,
  Phone,
  Search,
  Settings,
  SquarePlay,
  User,
  UserCog,
} from 'lucide-react';

export const NAV_ITEMS = [
  { key: 'home', view: 'home', label: 'Home', icon: House, rail: 1 },
  { key: 'posts', view: 'posts', label: 'Posts & updates', icon: Newspaper },
  { key: 'videos', view: 'videos', label: 'Videos', icon: SquarePlay, rail: 4 },
  { key: 'discover', view: 'discover', label: 'Discover', icon: Search, rail: 2 },
  { key: 'dating', view: 'dating', label: 'Dating', icon: Heart, rail: 5 },
  { key: 'messages', view: 'messages', label: 'Messages', icon: MessageCircle, rail: 6, badge: 'messages' },
  { key: 'calls', view: 'calls', label: 'Calls', icon: Phone },
  { key: 'saved', view: 'saved', label: 'Saved', icon: Bookmark },
  { key: 'music', view: 'music', label: 'Clarke Music', icon: Music },
  { key: 'movies', view: 'movies', label: 'Clarke Movies', icon: Clapperboard },
  { key: 'premium', view: 'premium', label: 'Supporter & Creator Plans', icon: Crown },
  { key: 'me', view: 'member', self: true, label: 'Profile', icon: User, rail: 7 },
  { key: 'settings', view: 'settings', label: 'Settings', icon: Settings },
  { key: 'account', view: 'account', label: 'Account', icon: UserCog },
];

const byKey = Object.fromEntries(NAV_ITEMS.map((item) => [item.key, item]));
const pick = (keys) => keys.map((k) => byKey[k]);

// Mobile account sheet (opened from the header avatar) and the tablet "More" drawer.
export const MOBILE_MORE = pick([
  'me',
  'posts',
  'videos',
  'music',
  'movies',
  'calls',
  'saved',
  'premium',
  'settings',
  'account',
]);
export const TABLET_MORE = pick(['posts', 'calls', 'saved', 'music', 'movies', 'premium', 'settings', 'account']);

// Whether a nav item represents the screen currently shown.
export function isActive(item, view, params, user) {
  if (item.self) return view === 'member' && Boolean(user) && Number(params?.id) === user.id;
  if (item.view === 'dating') return view === 'dating' || view === 'datingPremium';
  if (item.view === 'settings') return view === 'settings' || view === 'profile';
  return item.view === view;
}
