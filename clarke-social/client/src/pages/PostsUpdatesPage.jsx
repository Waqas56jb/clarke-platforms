// Posts & updates: short text posts (280 characters) with likes, replies, reposts and shares.
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import Avatar from '../components/Avatar';
import MicroPost from '../components/posts/MicroPost';
import { EmptyState, ErrorState, Loading } from '../components/StateView';
import { usePostActions } from '../hooks/usePostActions';
import { usePostList } from '../hooks/usePostList';
import { createTextPost, listPosts } from '../services/postsService';

export default function PostsUpdatesPage({ sort }) {
  const { user } = useAuth();
  const { openAuth } = useNavigation();
  const toast = useToast();
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const list = usePostList(() => listPosts({ view: 'updates', sort }).then((d) => d.posts), [sort, user?.id]);
  const actions = usePostActions(list.update, list.remove);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!user) return openAuth();
    const v = text.trim();
    if (!v) return;
    setPosting(true);
    try {
      const { post } = await createTextPost({ body: v });
      list.setData((posts) => [post, ...(posts || [])]);
      setText('');
    } catch (err) {
      toast(err.message);
    } finally {
      setPosting(false);
    }
  };

  // A repost appears as a new update, so reload the list after reposting.
  const repost = async (p) => {
    await actions.repost(p);
    list.reload();
  };

  let content;
  if (list.loading && !list.data) content = <Loading text="Loading updates…" />;
  else if (list.error && !list.data) content = <ErrorState message={list.error} onRetry={list.reload} />;
  else if (!list.data.length) content = <EmptyState title="No updates yet">Be the first to post an update.</EmptyState>;
  else
    content = list.data.map((p, i) => (
      <MicroPost
        key={p.id}
        post={p}
        index={i}
        actions={{ ...actions, repost }}
        onReplied={(id) => list.update(id, (x) => ({ comments: x.comments + 1 }))}
      />
    ));

  return (
    <>
      <section className="card-panel post-composer">
        <div className="person-row">
          <Avatar src={user?.avatar} name={user?.displayName || 'C'} color="avatar-blue" />
          <div className="person-info">
            <b>What&apos;s happening?</b>
            <small>Share a thought with the Clarke community</small>
          </div>
        </div>
        <form id="microPostForm" onSubmit={onSubmit}>
          <textarea
            id="microPostText"
            maxLength={280}
            placeholder="Write a post… (280 characters)"
            value={text}
            onChange={(e) => setText(e.target.value)}
          ></textarea>
          <div className="post-composer-foot">
            <span id="microCount">{text.length} / 280</span>
            <button className="btn btn-primary" type="submit" disabled={posting}>
              Post ↗
            </button>
          </div>
        </form>
      </section>
      <div className="post-tagline">
        <span>#ClarkeCommunity</span>
        <span>#Trending</span>
        <span>#YourVoice</span>
        <span>Public conversation</span>
      </div>
      <div id="microFeed">{content}</div>
    </>
  );
}
