import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Composer from '../components/Composer';
import Feed from '../components/Feed';
import FeedHeading from '../components/FeedHeading';
import Stories from '../components/Stories';
import WelcomeBanner from '../components/WelcomeBanner';
import { FEED_TITLES, PREVIEW_VIEWS, showsComposer, showsFeedHeading, showsStories } from '../utils/views';
import MoviesPage from './MoviesPage';
import MusicPage from './MusicPage';
import PostsUpdatesPage from './PostsUpdatesPage';

const PREVIEW_PAGES = { posts: PostsUpdatesPage, music: MusicPage, movies: MoviesPage };

// Home, Videos and Saved, plus the preview sections that reuse the home layout around the feed list.
export default function FeedPage({ view }) {
  const { user } = useAuth();
  const [sort, setSort] = useState('latest');
  const PreviewSection = PREVIEW_PAGES[view];
  const showBanner = !user && (view === 'home' || PREVIEW_VIEWS.includes(view));

  return (
    <>
      {showBanner && <WelcomeBanner />}
      {showsStories(view) && <Stories />}
      {showsComposer(view) && <Composer />}
      {showsFeedHeading(view) && <FeedHeading title={FEED_TITLES[view]} sort={sort} onSortChange={setSort} />}
      {PreviewSection ? (
        <div id="feed" className="feed-list">
          <PreviewSection />
        </div>
      ) : (
        <Feed view={view} sort={sort} />
      )}
    </>
  );
}
