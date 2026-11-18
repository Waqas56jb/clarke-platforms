// Posts & updates: short text posts (280 characters) with likes, replies, reposts and shares.
import { useState } from 'react';
import { ImagePlus, Newspaper } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import Avatar from '../components/Avatar';
import MicroPost from '../components/posts/MicroPost';
import { EmptyState, ErrorState, Loading } from '../components/StateView';
import { usePostActions } from '../hooks/usePostActions';
import { usePostList } from '../hooks/usePostList';
import { createTextPost, listPosts } from '../services/postsService';

const MAX = 280;

function QuickComposer({ onPosted }) {
  const { user } = useAuth();
  const { openAuth, openCreate } = useNavigation();
  const toast = useToast();
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!user) return openAuth();
    const body = text.trim();
    if (!body) return;
    setPosting(true);
    try {
      const { post } = await createTextPost({ body });
      onPosted(post);
      setText('');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setPosting(false);
    }
  };

  return (
    <section className="card composer-card micro-composer" aria-label="Post an update">
      <form id="microPostForm" onSubmit={onSubmit}>
        <div className="composer-row">
          <Avatar src={user?.avatar} name={user?.displayName || 'Clarke'} size="md" />
          <div className="field grow">
            <label className="field-label" htmlFor="microPostText">
              What&apos;s happening?
            </label>
            <textarea
              id="microPostText"
              maxLength={MAX}
              rows={2}
              placeholder="Share a thought with the Clarke community"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
        </div>
        <div className="micro-composer-foot">
          <button type="button" className="btn btn-ghost btn-sm" onClick={openCreate}>
            <ImagePlus size={20} aria-hidden="true" className="composer-icon-media" />
            Photo/Video
          </button>
          <span id="microCount" className={`caption grow${text.length >= MAX ? ' micro-count-full' : ''}`}>
            {text.length} / {MAX}
          </span>
          <button className="btn btn-primary btn-sm" type="submit" disabled={posting || !text.trim()}>
            {posting && <span className="spinner" aria-hidden="true" />}
            {posting ? 'Posting…' : 'Post'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default function PostsUpdatesPage({ sort, version }) {
  const { user } = useAuth();
  const list = usePostList(() => listPosts({ view: 'updates', sort }).then((d) => d.posts), [sort, version, user?.id]);
  const actions = usePostActions(list.update, list.remove);

  // A repost appears as a new update, so reload the list after reposting.
  const repost = async (p) => {
    await actions.repost(p);
    list.reload();
  };

  let content;
  if (list.loading && !list.data) content = <Loading text="Loading updates" variant="feed" count={3} />;
  else if (list.error && !list.data)
    content = <ErrorState title="Couldn't load updates." message={list.error} onRetry={list.reload} />;
  else if (!list.data.length)
    content = (
      <EmptyState icon={Newspaper} title="No updates yet.">
        Be the first to post an update.
      </EmptyState>
    );
  else
    content = list.data.map((p) => (
      <MicroPost
        key={p.id}
        post={p}
        actions={{ ...actions, repost }}
        onReplied={(id) => list.update(id, (x) => ({ comments: x.comments + 1 }))}
      />
    ));

  return (
    <>
      <QuickComposer onPosted={(post) => list.setData((posts) => [post, ...(posts || [])])} />
      <div id="microFeed" className="feed-list">
        {content}
      </div>
    </>
  );
}
