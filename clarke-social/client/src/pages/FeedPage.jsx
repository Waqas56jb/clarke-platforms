import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import Composer from '../components/Composer';
import Feed from '../components/Feed';
import FeedHeading from '../components/FeedHeading';
import Stories from '../components/Stories';
import WelcomeBanner from '../components/WelcomeBanner';
import { MOBILE_QUERY, useMediaQuery } from '../hooks/useMediaQuery';
import { FEED_TITLES, PREVIEW_VIEWS, showsComposer, showsFeedHeading, showsStories } from '../utils/views';
import MoviesPage from './MoviesPage';
import MusicPage from './MusicPage';
import PostsUpdatesPage from './PostsUpdatesPage';

const SECTIONS = { posts: PostsUpdatesPage, music: MusicPage, movies: MoviesPage };
const SUBTITLES = {
  home: 'Fresh updates from the people you follow and the Clarke community.',
  videos: 'Watch what the community is sharing.',
  saved: 'Posts you saved for later.',
  posts: 'Short updates and conversations from the Clarke community.',
};

// Home, Videos and Saved, plus the Posts, Music and Movies sections that share the home layout.
export default function FeedPage({ view }) {
  const { user } = useAuth();
  const { feedVersion } = useNavigation();
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const [sort, setSort] = useState('latest');
  const Section = SECTIONS[view];
  const showBanner = !user && (view === 'home' || PREVIEW_VIEWS.includes(view));
  // Phones get an immersive, full-height Videos feed without the page heading.
  const immersive = view === 'videos' && isMobile;

  return (
    <>
      {view === 'home' && <h1 className="sr-only">Home</h1>}
      {immersive && <h1 className="sr-only">Videos</h1>}
      {showBanner && <WelcomeBanner />}
      {showsStories(view) && <Stories />}
      {/* Posts & updates has its own quick composer. */}
      {showsComposer(view) && !Section && <Composer />}
      {showsFeedHeading(view) && !immersive && (
        <FeedHeading
          title={FEED_TITLES[view]}
          subtitle={SUBTITLES[view]}
          sort={sort}
          onSortChange={setSort}
          level={view === 'home' ? 2 : 1}
        />
      )}
      {Section ? (
        <div id="feed" className="feed-list">
          <Section sort={sort} version={feedVersion} />
        </div>
      ) : (
        <Feed view={view} sort={sort} version={feedVersion} />
      )}
    </>
  );
}
