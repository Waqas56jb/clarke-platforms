import { useState } from 'react';

function withHashtags(text) {
  return text.split(/((?:^|\s)#[A-Za-z0-9_]+)/g).map((part, i) => {
    const match = part.match(/^(\s?)(#[A-Za-z0-9_]+)$/);
    if (!match) return part;
    return (
      <span key={i}>
        {match[1]}
        <span className="hashtag">{match[2]}</span>
      </span>
    );
  });
}

export default function MicroPost({ post: p, index, onLike, onRepost, onShare, onReply }) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [reply, setReply] = useState('');

  const sendReply = () => {
    const v = reply.trim();
    if (!v) return;
    onReply(index, v);
    setReply('');
    setReplyOpen(false);
  };

  return (
    <article className="card-panel micro-post">
      <div className="micro-post-head">
        <div className={`avatar ${index % 2 ? 'avatar-orange' : 'avatar-purple'}`}>{p.name[0]}</div>
        <div className="person-info">
          <b>{p.name}</b>
          <small>
            {p.handle} · {p.time}
          </small>
        </div>
      </div>
      <div className="micro-post-body">{withHashtags(p.text)}</div>
      <div className="post-actions">
        <button className={p.liked ? 'selected' : ''} onClick={() => onLike(index)}>
          ♥ {p.likes} Like
        </button>
        <button onClick={() => setReplyOpen((o) => !o)}>▢ Reply ({p.replies.length})</button>
        <button className={p.reposted ? 'selected' : ''} onClick={() => onRepost(index)}>
          {p.reposted ? '↻ Reposted' : '↻ Repost'}
        </button>
        <button onClick={() => onShare(index)}>↗ Share</button>
      </div>
      {p.replies.length ? (
        <div className="reply-list">
          {p.replies.map((r, i) => (
            <p key={i}>{r}</p>
          ))}
        </div>
      ) : null}
      <div className={`reply-box${replyOpen ? '' : ' hidden'}`}>
        <input maxLength={500} placeholder="Write a reply…" value={reply} onChange={(e) => setReply(e.target.value)} />
        <button className="btn btn-primary" onClick={sendReply}>
          Send
        </button>
      </div>
    </article>
  );
}
