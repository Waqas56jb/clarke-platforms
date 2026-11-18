import { useAuth } from '../context/AuthContext';
import { usePostActions } from '../hooks/usePostActions';
import { listPosts } from '../services/postsService';
import { usePostList } from '../hooks/usePostList';
import PostCard from './PostCard';
import { EmptyState, ErrorState, Loading } from './StateView';

const EMPTY_TITLES = {
  videos: 'Videos are waiting to be discovered',
  saved: 'No saved posts yet',
  home: 'Your feed is ready for its first post',
};

export default function Feed({ view, sort, version }) {
  const { user } = useAuth();
  const apiView = { home: 'all', videos: 'videos', saved: 'saved' }[view];
  const list = usePostList(
    () => listPosts({ view: apiView, sort }).then((d) => d.posts),
    [apiView, sort, version, user?.id]
  );
  // In the Saved view, un-saving a post removes it from the list.
  const update = (id, change) =>
    view === 'saved' && change.saved === false ? list.remove(id) : list.update(id, change);
  const actions = usePostActions(update, list.remove);

  let content;
  if (list.loading && !list.data) content = <Loading text="Loading your community feed…" />;
  else if (list.error && !list.data) content = <ErrorState message={list.error} onRetry={list.reload} />;
  else if (!list.data.length)
    content = <EmptyState title={EMPTY_TITLES[view]}>Share something or explore the Clarke community.</EmptyState>;
  else content = list.data.map((p) => <PostCard key={p.id} post={p} actions={actions} />);

  return (
    <div id="feed" className={`feed-list${view === 'videos' ? ' videos-feed' : ''}`}>
      {content}
    </div>
  );
}
