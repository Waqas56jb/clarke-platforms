import { useCallback, useEffect, useState } from 'react';
import { useFeed } from '../context/FeedContext';
import { useToast } from '../context/ToastContext';
import { addComment, listComments } from '../services/postsService';

export default function CommentsModal() {
  const { commentPostId, setCommentPostId, loadFeed } = useFeed();
  const toast = useToast();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');

  const load = useCallback(
    () => listComments(commentPostId).then((data) => setComments(data.comments)),
    [commentPostId]
  );

  useEffect(() => {
    if (!commentPostId) return;
    listComments(commentPostId)
      .then((data) => setComments(data.comments))
      .catch((err) => toast(err.message));
  }, [commentPostId, toast]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    try {
      await addComment(commentPostId, body);
      setText('');
      await load();
      await loadFeed();
    } catch (err) {
      toast(err.message);
    }
  };

  return (
    <div className={`modal-backdrop${commentPostId ? '' : ' hidden'}`} id="commentsModal">
      <section className="modal">
        <button className="modal-close" onClick={() => setCommentPostId(null)}>
          ×
        </button>
        <h2>Comments</h2>
        <div id="commentsList" className="comments-list">
          {comments.length ? (
            comments.map((c) => (
              <div className="comment" key={c.id}>
                <b>
                  {c.display_name} (@{c.username})
                </b>
                {c.body}
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--muted)', fontSize: 11 }}>Be the first to comment.</p>
          )}
        </div>
        <form id="commentForm" className="comment-form" onSubmit={onSubmit}>
          <input
            id="commentText"
            placeholder="Write a comment…"
            maxLength={800}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button className="btn btn-primary">Send</button>
        </form>
      </section>
    </div>
  );
}
