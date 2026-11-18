export const FEED_VIEWS = ['home', 'videos', 'saved'];
// Sections from the Movies preview that keep the home layout and replace only the feed list.
export const PREVIEW_VIEWS = ['posts', 'music', 'movies'];
export const AUTH_REQUIRED_VIEWS = ['dating', 'profile'];

export const showsRightColumn = (view) => ['home', 'videos', ...PREVIEW_VIEWS].includes(view);
export const showsComposer = (view) => ['home', 'videos', ...PREVIEW_VIEWS].includes(view);
export const showsStories = (view) => ['home', ...PREVIEW_VIEWS].includes(view);
export const showsFeedHeading = (view) => [...FEED_VIEWS, ...PREVIEW_VIEWS].includes(view);

export const FEED_TITLES = {
  home: 'Your feed',
  videos: 'Discover videos',
  saved: 'Saved posts',
  posts: 'Posts & updates',
  music: 'Clarke Music',
  movies: 'Clarke Movies',
};
