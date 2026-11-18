// A single post, opened from a shared link, search, or a notification.
import PostCard from '../components/PostCard';
import { AsyncView } from '../components/StateView';
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
  return (
    <>
      <ViewHeading title="Post" subtitle="Shared from the Clarke community." />
      <AsyncView state={state} loadingText="Loading post…">
        {(post) => <PostCard post={post} actions={actions} />}
      </AsyncView>
    </>
  );
}
