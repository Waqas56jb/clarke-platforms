import { Bookmark, RefreshCw, SquarePlay, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { MOBILE_QUERY, useMediaQuery } from '../hooks/useMediaQuery';
import { usePostActions } from '../hooks/usePostActions';
import { usePostList } from '../hooks/usePostList';
import { listPosts } from '../services/postsService';
import { PULL_THRESHOLD, usePullToRefresh } from './feed/usePullToRefresh';
import VideoFeed from './feed/VideoFeed';
import PostCard from './PostCard';
import { EmptyState, ErrorState, Loading } from './StateView';

const API_VIEWS = { home: 'all', videos: 'videos', saved: 'saved' };

function Empty({ view }) {
  const { navigate } = useNavigation();
  if (view === 'videos') return <EmptyState icon={SquarePlay} title="No videos available right now." />;
  if (view === 'saved')
    return (
      <EmptyState icon={Bookmark} title="No saved posts yet.">
        Save posts to find them here later.
      </EmptyState>
    );
  return (
    <EmptyState
      icon={Users}
      title="Your feed is looking quiet."
      action={
        <button type="button" className="btn btn-primary" onClick={() => navigate('discover')}>
          Discover People
        </button>
      }
    >
      Follow people to see their latest updates.
    </EmptyState>
  );
}

function PullIndicator({ pull, refreshing }) {
  if (!pull && !refreshing) return null;
  const label = refreshing ? 'Refreshing…' : pull >= PULL_THRESHOLD ? 'Release to refresh' : 'Pull to refresh';
  return (
    <div className="ptr-indicator" style={{ height: refreshing ? PULL_THRESHOLD : pull }} aria-live="polite">
      <RefreshCw
        size={20}
        aria-hidden="true"
        className={refreshing ? 'ptr-spin' : undefined}
        style={refreshing ? undefined : { transform: `rotate(${pull * 3}deg)` }}
      />
      <span className="caption">{label}</span>
    </div>
  );
}

// Home, Videos and Saved lists. The API returns the latest 60 posts per view (it has no paging).
export default function Feed({ view, sort, version }) {
  const { user } = useAuth();
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const apiView = API_VIEWS[view];
  const list = usePostList(
    () => listPosts({ view: apiView, sort }).then((d) => d.posts),
    [apiView, sort, version, user?.id]
  );
  // In the Saved view, un-saving a post removes it from the list.
  const update = (id, change) =>
    view === 'saved' && change.saved === false ? list.remove(id) : list.update(id, change);
  const actions = usePostActions(update, list.remove);
  const ptr = usePullToRefresh(list.reload, isMobile && view === 'home');

  let content;
  if (list.loading && !list.data) content = <Loading text="Loading posts" variant="feed" count={3} />;
  else if (list.error && !list.data)
    content = <ErrorState title="Couldn't load your feed." message="Please try again." onRetry={list.reload} />;
  else if (!list.data.length) content = <Empty view={view} />;
  else if (view === 'videos') content = <VideoFeed posts={list.data} actions={actions} />;
  else content = list.data.map((p) => <PostCard key={p.id} post={p} actions={actions} />);

  return (
    <>
      <PullIndicator {...ptr} />
      {list.error && list.data && (
        <div className="notice notice-error feed-notice" role="alert">
          <span className="grow">Couldn&apos;t refresh your feed. Please try again.</span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={list.reload}>
            Retry
          </button>
        </div>
      )}
      <div
        id="feed"
        className={`feed-list${view === 'videos' ? ' videos-feed' : ''}`}
        aria-busy={list.loading || undefined}
      >
        {content}
      </div>
    </>
  );
}
