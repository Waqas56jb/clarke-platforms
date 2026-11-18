import { useState } from 'react';
import { MessageCircle, Repeat2, Send, Share2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';
import { useAsync } from '../../hooks/useAsync';
import { addComment, listComments } from '../../services/postsService';
import { formatDateTime, timeAgo } from '../../utils/format';
import Avatar from '../Avatar';
import LikeButton from '../feed/LikeButton';
import PostBody from '../feed/PostBody';
import PostMenu from '../feed/PostMenu';

function Replies({ post, onReplied }) {
  const { user } = useAuth();
  const { openAuth } = useNavigation();
  const toast = useToast();
  const state = useAsync(() => listComments(post.id).then((d) => d.comments), [post.id]);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  const send = async (e) => {
    e.preventDefault();
    if (!user) return openAuth();
    const body = reply.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      const { comment } = await addComment(post.id, body);
      state.setData((r) => [...(r || []), comment]);
      setReply('');
      onReplied(post.id);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSending(false);
    }
  };

  const inputId = `reply-${post.id}`;
  return (
    <div className="micro-replies">
      {state.error && !state.data && (
        <p className="inline-error">
          {state.error}{' '}
          <button type="button" className="btn-link" onClick={state.reload}>
            Try again
          </button>
        </p>
      )}
      {state.loading && !state.data && <p className="caption">Loading replies…</p>}
      {state.data?.length > 0 && (
        <ul className="micro-reply-list">
          {state.data.map((r) => (
            <li key={r.id} className="micro-reply">
              <Avatar src={r.avatar} name={r.display_name} size="xs" />
              <p>
                <b>{r.display_name}</b> {r.body}
              </p>
            </li>
          ))}
        </ul>
      )}
      <form className="micro-reply-form" onSubmit={send}>
        <label className="sr-only" htmlFor={inputId}>
          Write a reply
        </label>
        <input
          id={inputId}
          className="input"
          maxLength={800}
          placeholder="Write a reply…"
          value={reply}
          autoComplete="off"
          onChange={(e) => setReply(e.target.value)}
        />
        <button type="submit" className="icon-btn" aria-label="Send reply" disabled={sending || !reply.trim()}>
          {sending ? <span className="spinner" aria-hidden="true" /> : <Send size={20} aria-hidden="true" />}
        </button>
      </form>
    </div>
  );
}

// A short update in Posts & updates. Reposts show the original text.
export default function MicroPost({ post: p, actions, onReplied }) {
  const { navigate } = useNavigation();
  const [replyOpen, setReplyOpen] = useState(false);
  const shown = p.original || p;
  const target = shown.id === p.id ? p : { ...p, id: shown.id };
  const name = p.displayName || p.username;
  const openMember = () => navigate('member', { id: p.userId });

  return (
    <article className="card micro-post" aria-label={`Update by ${name}`}>
      <header className="post-head">
        <button type="button" className="avatar-button" onClick={openMember} aria-label={`Open ${name}'s profile`}>
          <Avatar src={p.avatar} name={name} size="md" />
        </button>
        <div className="post-author">
          <p className="post-author-line">
            <button type="button" className="post-author-name" onClick={openMember}>
              {name}
            </button>
            {p.original && (
              <span className="post-feeling">
                <Repeat2 size={16} aria-hidden="true" /> reposted {p.original.displayName}
              </span>
            )}
          </p>
          <p className="post-meta">
            <span className="truncate">@{p.username}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={p.createdAt} title={formatDateTime(p.createdAt)}>
              {timeAgo(p.createdAt)}
            </time>
          </p>
        </div>
        <PostMenu post={p} actions={{ ...actions, repost: undefined }} />
      </header>
      <PostBody text={shown.body} />
      <div className="post-actions">
        <LikeButton post={p} onLike={actions.like}>
          <span className="post-action-label">{p.likes}</span>
        </LikeButton>
        <button
          type="button"
          className={`post-action${replyOpen ? ' active' : ''}`}
          aria-expanded={replyOpen}
          aria-label={`Replies (${p.comments})`}
          onClick={() => setReplyOpen((o) => !o)}
        >
          <MessageCircle size={20} aria-hidden="true" />
          <span className="post-action-label">{p.comments}</span>
        </button>
        <button
          type="button"
          className={`post-action${p.reposted ? ' reposted' : ''}`}
          aria-label={p.reposted ? 'Undo repost' : 'Repost'}
          aria-pressed={p.reposted}
          onClick={() => actions.repost(target)}
        >
          <Repeat2 size={20} aria-hidden="true" />
          <span className="post-action-label">{p.reposts || ''}</span>
        </button>
        <button type="button" className="post-action" aria-label="Share post" onClick={() => actions.share(target)}>
          <Share2 size={20} aria-hidden="true" />
          <span className="post-action-label">Share</span>
        </button>
      </div>
      {replyOpen && <Replies post={p} onReplied={onReplied} />}
    </article>
  );
}
