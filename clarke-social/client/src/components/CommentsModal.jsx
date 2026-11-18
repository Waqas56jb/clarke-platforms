import { useState } from 'react';
import { useComments } from '../context/CommentsContext';
import { useToast } from '../context/ToastContext';
import { useAsync } from '../hooks/useAsync';
import { addComment, listComments } from '../services/postsService';
import Avatar from './Avatar';

function CommentsBody({ postId, onAdded }) {
  const toast = useToast();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const state = useAsync(() => listComments(postId).then((d) => d.comments), [postId]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setSending(true);
    try {
      const { comment } = await addComment(postId, body);
      setText('');
      state.setData((list) => [...(list || []), comment]);
      onAdded?.();
    } catch (err) {
      toast(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div id="commentsList" className="comments-list">
        {state.loading && <p style={{ color: 'var(--muted)', fontSize: 11 }}>Loading comments…</p>}
        {state.error && <p className="inline-error">{state.error}</p>}
        {state.data?.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 11 }}>Be the first to comment.</p>}
        {state.data?.map((c) => (
          <div className="comment" key={c.id} style={{ display: 'flex', gap: 8 }}>
            <Avatar src={c.avatar} name={c.display_name} />
            <div>
              <b>
                {c.display_name} (@{c.username})
              </b>
              {c.body}
            </div>
          </div>
        ))}
      </div>
      <form id="commentForm" className="comment-form" onSubmit={onSubmit}>
        <input
          id="commentText"
          placeholder="Write a comment…"
          maxLength={800}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn btn-primary" disabled={sending}>
          Send
        </button>
      </form>
    </>
  );
}

export default function CommentsModal() {
  const { open, closeComments } = useComments();
  return (
    <div className={`modal-backdrop${open ? '' : ' hidden'}`} id="commentsModal">
      <section className="modal">
        <button className="modal-close" onClick={closeComments} aria-label="Close">
          ×
        </button>
        <h2>Comments</h2>
        {open && <CommentsBody key={open.postId} postId={open.postId} onAdded={open.onAdded} />}
      </section>
    </div>
  );
}
