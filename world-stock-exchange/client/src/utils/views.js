// Every screen that can appear in the address bar (?view=...).
export const KNOWN_VIEWS = [
  'home',
  'markets',
  'trade',
  'portfolio',
  'listings',
  'listing',
  'issuer',
  'review',
  'fund',
  'info',
  'account',
  'settings',
];

// Signed-out visitors are asked to sign in before these open.
export const AUTH_REQUIRED_VIEWS = ['portfolio', 'issuer', 'review', 'account'];

export const VIEW_TITLES = {
  home: 'Home',
  markets: 'Markets',
  trade: 'Trade',
  portfolio: 'Portfolio',
  listings: 'Company listings',
  listing: 'Company listing',
  issuer: 'List your company',
  review: 'Review applications',
  fund: 'Gold & diamonds',
  info: 'Payments & security',
  account: 'Account',
  settings: 'Settings',
};
