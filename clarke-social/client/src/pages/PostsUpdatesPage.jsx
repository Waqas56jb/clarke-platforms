// "Posts & updates" demo from the Movies preview. Posts live in memory only; there is no backend for it.
import { useState } from 'react';
import MicroPost from '../components/posts/MicroPost';

const INITIAL_POSTS = [
  {
    id: 1,
    name: 'Maya Lewis',
    handle: '@mayacreates',
    time: '12 min',
    text: 'A new day, a fresh perspective. What is one thing you are looking forward to today? ✨',
    likes: 24,
    replies: ['Looking forward to creating something new!'],
  },
  {
    id: 2,
    name: 'Jordan Blake',
    handle: '@jordanb',
    time: '38 min',
    text: 'Grenada sunsets never get old. Share a photo from your corner of the world! 🌅',
    likes: 17,
    replies: [],
  },
  {
    id: 3,
    name: 'Clarke Community',
    handle: '@clarke',
    time: '1 hr',
    text: 'Welcome to Clarke — a place to share ideas, meet people and join the conversation. #ClarkeCommunity',
    likes: 42,
    replies: [],
  },
];

export default function PostsUpdatesPage() {
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [text, setText] = useState('');
  // The original preview only draws the post list after the first submission; kept as-is.
  const [listShown, setListShown] = useState(false);

  const update = (i, change) => setPosts((all) => all.map((p, idx) => (idx === i ? { ...p, ...change(p) } : p)));

  const onSubmit = (e) => {
    e.preventDefault();
    const v = text.trim();
    if (!v) return;
    setPosts((all) => [
      { id: Date.now(), name: 'You', handle: '@you', time: 'just now', text: v, likes: 0, replies: [] },
      ...all,
    ]);
    setText('');
    setListShown(true);
  };

  const onShare = (i) => {
    const postText = posts[i].text;
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(postText).then(() => alert('Post text copied.'));
    else alert(postText);
  };

  return (
    <>
      <section className="card-panel post-composer">
        <div className="person-row">
          <div className="avatar avatar-blue">C</div>
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
            <button className="btn btn-primary" type="submit">
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
      <div id="microFeed">
        {listShown &&
          posts.map((p, i) => (
            <MicroPost
              key={p.id}
              post={p}
              index={i}
              onLike={(idx) => update(idx, (x) => ({ liked: !x.liked, likes: x.likes + (x.liked ? -1 : 1) }))}
              onRepost={(idx) => update(idx, (x) => ({ reposted: !x.reposted }))}
              onShare={onShare}
              onReply={(idx, v) => update(idx, (x) => ({ replies: [...x.replies, v] }))}
            />
          ))}
      </div>
    </>
  );
}
