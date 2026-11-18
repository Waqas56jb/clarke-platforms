import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useComments } from '../context/CommentsContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import { useAsync } from '../hooks/useAsync';
import { addComment, listComments } from '../services/postsService';
import { formatDateTime, timeAgo } from '../utils/format';
import Avatar from './Avatar';
import { EmptyState, ErrorState, Loading } from './StateView';
import Dialog from './ui/Dialog';

function Comment({ comment: c, onOpenMember }) {
  return (
    <li className="comment">
      <button
        type="button"
        className="avatar-button"
        onClick={onOpenMember}
        aria-label={`Open ${c.display_name}'s profile`}
      >
        <Avatar src={c.avatar} name={c.display_name} size="sm" />
      </button>
      <div className="comment-main">
        <p className="comment-head">
          <button type="button" className="comment-name" onClick={onOpenMember}>
            {c.display_name}
          </button>
          <span className="truncate">@{c.username}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={c.created_at} title={formatDateTime(c.created_at)}>
            {timeAgo(c.created_at)}
          </time>
        </p>
        <p className="comment-body">{c.body}</p>
      </div>
    </li>
  );
}

function CommentForm({ postId, onAdded }) {
  const { user } = useAuth();
  const { openAuth } = useNavigation();
  const toast = useToast();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  if (!user)
    return (
      <div className="comment-signin">
        <span className="text-sm text-muted grow">Sign in to join the conversation.</span>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => openAuth()}>
          Sign in
        </button>
      </div>
    );

  const onSubmit = async (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      const { comment } = await addComment(postId, body);
      setText('');
      onAdded(comment);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <form id="commentForm" className="comment-form" onSubmit={onSubmit}>
      <Avatar src={user.avatar} name={user.displayName} size="sm" />
      <label className="sr-only" htmlFor="commentText">
        Write a comment
      </label>
      <input
        id="commentText"
        className="input"
        placeholder="Write a comment…"
        maxLength={800}
        value={text}
        autoComplete="off"
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit" className="btn btn-primary" disabled={sending || !text.trim()}>
        {sending ? <span className="spinner" aria-hidden="true" /> : <Send size={20} aria-hidden="true" />}
        Post
      </button>
    </form>
  );
}

function CommentsDialog({ postId, onAdded, onClose }) {
  const { navigate } = useNavigation();
  const state = useAsync(() => listComments(postId).then((d) => d.comments), [postId]);
  const endRef = useRef(null);
  const [added, setAdded] = useState(0);

  useEffect(() => {
    if (added) endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [added]);

  const openMember = (id) => {
    onClose();
    navigate('member', { id });
  };

  let content;
  if (state.loading && !state.data) content = <Loading text="Loading comments" variant="list" count={4} />;
  else if (state.error && !state.data)
    content = <ErrorState plain title="Couldn't load comments." message={state.error} onRetry={state.reload} />;
  else if (!state.data.length)
    content = (
      <EmptyState plain icon={MessageCircle} title="Be the first to comment.">
        Start the conversation on this post.
      </EmptyState>
    );
  else
    content = (
      <ul className="comments-list" aria-live="polite">
        {state.data.map((c) => (
          <Comment key={c.id} comment={c} onOpenMember={() => openMember(c.user_id)} />
        ))}
      </ul>
    );

  return (
    <Dialog
      id="commentsModal"
      title="Comments"
      onClose={onClose}
      size="lg"
      className="comments-dialog"
      footer={
        <CommentForm
          postId={postId}
          onAdded={(comment) => {
            state.setData((list) => [...(list || []), comment]);
            setAdded((n) => n + 1);
            onAdded?.();
          }}
        />
      }
    >
      {content}
      <div ref={endRef} />
    </Dialog>
  );
}

// Comments for the post chosen with openComments(); a bottom sheet on phones.
export default function CommentsModal() {
  const { open, closeComments } = useComments();
  if (!open) return null;
  return <CommentsDialog key={open.postId} postId={open.postId} onAdded={open.onAdded} onClose={closeComments} />;
}
