import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';
import { addComment, listComments } from '../../services/postsService';
import { timeAgo } from '../../utils/format';
import Avatar from '../Avatar';

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

export default function MicroPost({ post: p, index, actions, onReplied }) {
  const { user } = useAuth();
  const { openAuth, navigate } = useNavigation();
  const toast = useToast();
  const [replyOpen, setReplyOpen] = useState(false);
  const [replies, setReplies] = useState(null);
  const [reply, setReply] = useState('');
  const shown = p.original || p;

  const toggleReplies = async () => {
    const opening = !replyOpen;
    setReplyOpen(opening);
    if (opening && replies === null) {
      try {
        setReplies((await listComments(p.id)).comments);
      } catch (e) {
        toast(e.message);
      }
    }
  };

  const sendReply = async () => {
    if (!user) return openAuth();
    const v = reply.trim();
    if (!v) return;
    try {
      const { comment } = await addComment(p.id, v);
      setReplies((r) => [...(r || []), comment]);
      setReply('');
      onReplied(p.id);
    } catch (e) {
      toast(e.message);
    }
  };

  return (
    <article className="card-panel micro-post">
      <div className="micro-post-head">
        <Avatar src={p.avatar} name={p.displayName} color={index % 2 ? 'avatar-orange' : 'avatar-purple'} />
        <div className="person-info" style={{ cursor: 'pointer' }} onClick={() => navigate('member', { id: p.userId })}>
          <b>
            {p.displayName}
            {p.original && <span className="post-feeling"> reposted {p.original.displayName}</span>}
          </b>
          <small>
            @{p.username} · {timeAgo(p.createdAt)}
          </small>
        </div>
      </div>
      <div className="micro-post-body">{withHashtags(shown.body || '')}</div>
      <div className="post-actions">
        <button className={p.liked ? 'selected' : ''} onClick={() => actions.like(p)}>
          ♥ {p.likes} Like
        </button>
        <button onClick={toggleReplies}>▢ Reply ({p.comments})</button>
        <button
          className={p.reposted ? 'selected' : ''}
          onClick={() => actions.repost(shown.id === p.id ? p : { ...p, id: shown.id })}
        >
          {p.reposted ? '↻ Reposted' : '↻ Repost'}
        </button>
        <button onClick={() => actions.share(shown.id === p.id ? p : { ...p, id: shown.id })}>↗ Share</button>
      </div>
      {replyOpen && replies?.length ? (
        <div className="reply-list">
          {replies.map((r) => (
            <p key={r.id}>
              <b>{r.display_name}:</b> {r.body}
            </p>
          ))}
        </div>
      ) : null}
      <div className={`reply-box${replyOpen ? '' : ' hidden'}`}>
        <input maxLength={800} placeholder="Write a reply…" value={reply} onChange={(e) => setReply(e.target.value)} />
        <button className="btn btn-primary" onClick={sendReply}>
          Send
        </button>
      </div>
    </article>
  );
}
