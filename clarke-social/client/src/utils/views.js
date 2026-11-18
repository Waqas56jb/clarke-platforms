export const FEED_VIEWS = ['home', 'videos', 'saved'];
// Sections that keep the home layout and replace only the feed list.
export const PREVIEW_VIEWS = ['posts', 'music', 'movies'];
// Logged-out members are asked to sign in before these open.
export const AUTH_REQUIRED_VIEWS = [
  'dating',
  'datingPremium',
  'profile',
  'messages',
  'calls',
  'saved',
  'settings',
  'account',
];

// Screens that use the full width (no 760px column, no right panel).
export const WIDE_VIEWS = ['messages', 'music', 'movies', 'premium', 'datingPremium', 'settings'];
// Screens that show the contextual right panel on desktop.
export const RIGHT_PANEL_VIEWS = [
  'home',
  'videos',
  'posts',
  'saved',
  'discover',
  'dating',
  'member',
  'post',
  'connections',
];

export const showsRightColumn = (view) => RIGHT_PANEL_VIEWS.includes(view);
export const isWideView = (view) => WIDE_VIEWS.includes(view);
export const showsComposer = (view) => view === 'home';
export const showsStories = (view) => view === 'home';
export const showsFeedHeading = (view) => [...FEED_VIEWS, 'posts'].includes(view);

export const FEED_TITLES = {
  home: 'Your feed',
  videos: 'Videos',
  saved: 'Saved posts',
  posts: 'Posts & updates',
  music: 'Clarke Music',
  movies: 'Clarke Movies',
};

// Every screen that can appear in the address bar (?view=...).
export const KNOWN_VIEWS = [
  ...FEED_VIEWS,
  ...PREVIEW_VIEWS,
  'discover',
  'dating',
  'datingPremium',
  'messages',
  'calls',
  'profile',
  'settings',
  'account',
  'premium',
  'member',
  'connections',
  'post',
];
