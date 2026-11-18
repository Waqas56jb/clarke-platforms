// A single post, opened from a shared link, search, or a notification.
import { ArrowLeft } from 'lucide-react';
import PostCard from '../components/PostCard';
import { ErrorState, Loading } from '../components/StateView';
import ViewHeading from '../components/ViewHeading';
import { useAsync } from '../hooks/useAsync';
import { usePostActions } from '../hooks/usePostActions';
import { useNavigation } from '../context/NavigationContext';
import { getPost } from '../services/postsService';

export default function PostPage({ params }) {
  const { navigate } = useNavigation();
  const state = useAsync(() => getPost(params.id).then((d) => d.post), [params.id]);
  const actions = usePostActions(
    (_id, change) => state.setData((p) => ({ ...p, ...(typeof change === 'function' ? change(p) : change) })),
    () => navigate('home')
  );

  let content;
  if (state.loading && !state.data) content = <Loading text="Loading post" variant="feed" />;
  else if (state.error && !state.data)
    content = <ErrorState title="Couldn't load this post." message={state.error} onRetry={state.reload} />;
  else content = <PostCard post={state.data} actions={actions} />;

  return (
    <>
      <button type="button" className="btn btn-ghost btn-sm back-button" onClick={() => navigate('home')}>
        <ArrowLeft size={20} aria-hidden="true" />
        Back to feed
      </button>
      <ViewHeading title="Post" subtitle="Shared from the Clarke community." />
      {content}
    </>
  );
}
