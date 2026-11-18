import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import { useFeed } from '../context/FeedContext';
import { downloadMedia, reportPost, toggleLike } from '../services/postsService';
import PostCard from './PostCard';
import SamplePosts from './SamplePosts';

const EMPTY_TITLES = {
  videos: 'Videos are waiting to be discovered',
  saved: 'No saved posts yet',
  home: 'Your feed is ready for its first post',
};

export default function Feed({ view, sort }) {
  const { user } = useAuth();
  const { openAuth } = useNavigation();
  const toast = useToast();
  const { posts, status, loadFeed, saved, setCommentPostId } = useFeed();

  const requireUser = (fn) => (id) => (user ? fn(id) : openAuth());

  const onLike = requireUser(async (id) => {
    try {
      await toggleLike(id);
      await loadFeed();
    } catch (err) {
      toast(err.message);
    }
  });

  const onComments = requireUser((id) => setCommentPostId(id));

  const onReport = requireUser(async (id) => {
    const reason = window.prompt('Why are you reporting this post?');
    if (!reason) return;
    try {
      const d = await reportPost(id, reason);
      toast(d.message);
    } catch (err) {
      toast(err.message);
    }
  });

  const onDownload = async (id) => {
    try {
      const blob = await downloadMedia(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'clarke-video';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast(err.message);
    }
  };

  let visible = [...posts];
  if (view === 'videos') visible = visible.filter((p) => p.mediaType.startsWith('video/'));
  if (view === 'saved') visible = visible.filter((p) => saved.has(p.id));
  if (sort === 'popular') visible.sort((a, b) => b.likes - a.likes);

  let content;
  if (status.loading) content = <div className="loading-card">Loading your community feed…</div>;
  else if (status.error)
    content = (
      <div className="empty-state">
        Could not load the feed.<p>{status.error}</p>
      </div>
    );
  else if (visible.length)
    content = visible.map((p) => (
      <PostCard
        key={p.id}
        post={p}
        saved={saved.has(p.id)}
        onLike={onLike}
        onComments={onComments}
        onSave={saved.toggle}
        onDownload={onDownload}
        onReport={onReport}
      />
    ));
  else
    content = (
      <>
        <div className="empty-state">
          <div style={{ fontSize: 28, color: '#155eef' }}>✧</div>
          <b>{EMPTY_TITLES[view]}</b>
          <p>Share something or explore the Clarke community.</p>
        </div>
        {view === 'home' && <SamplePosts />}
      </>
    );

  return (
    <div id="feed" className={`feed-list${view === 'videos' ? ' videos-feed' : ''}`}>
      {content}
    </div>
  );
}
