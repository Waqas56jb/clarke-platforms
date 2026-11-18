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

const SECTIONS = { posts: PostsUpdatesPage, music: MusicPage, movies: MoviesPage };

// Home, Videos and Saved, plus the Posts, Music and Movies sections that share the home layout.
export default function FeedPage({ view }) {
  const { user } = useAuth();
  const [sort, setSort] = useState('latest');
  const [version, setVersion] = useState(0);
  const Section = SECTIONS[view];
  const showBanner = !user && (view === 'home' || PREVIEW_VIEWS.includes(view));

  return (
    <>
      {showBanner && <WelcomeBanner />}
      {showsStories(view) && <Stories />}
      {showsComposer(view) && <Composer onPosted={() => setVersion((v) => v + 1)} />}
      {showsFeedHeading(view) && <FeedHeading title={FEED_TITLES[view]} sort={sort} onSortChange={setSort} />}
      {Section ? (
        <div id="feed" className="feed-list">
          <Section sort={sort} version={version} />
        </div>
      ) : (
        <Feed view={view} sort={sort} version={version} />
      )}
    </>
  );
}
