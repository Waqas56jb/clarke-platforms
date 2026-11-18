import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { deleteStory } from '../services/storiesService';
import { mediaUrl } from '../services/http';
import { timeAgo } from '../utils/format';

const IMAGE_SECONDS = 5;

// Plays every active story in order, moving to the next member's stories automatically.
export default function StoryViewer({ groups, startIndex, onClose, onDeleted }) {
  const { user } = useAuth();
  const toast = useToast();
  const [pos, setPos] = useState({ group: startIndex, story: 0 });
  const group = groups[pos.group];
  const story = group?.stories[pos.story];

  const next = () =>
    setPos((p) => {
      if (p.story + 1 < groups[p.group].stories.length) return { ...p, story: p.story + 1 };
      if (p.group + 1 < groups.length) return { group: p.group + 1, story: 0 };
      onClose();
      return p;
    });
  const prev = () =>
    setPos((p) => (p.story > 0 ? { ...p, story: p.story - 1 } : p.group > 0 ? { group: p.group - 1, story: 0 } : p));

  useEffect(() => {
    if (!story || story.mediaType.startsWith('video/')) return undefined;
    const t = setTimeout(next, IMAGE_SECONDS * 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id]);

  if (!story) return null;

  const remove = async () => {
    if (!window.confirm('Delete this story?')) return;
    try {
      await deleteStory(story.id);
      toast('Story deleted.');
      onDeleted();
    } catch (e) {
      toast(e.message);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="modal story-viewer" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="story-progress">
          {group.stories.map((s, i) => (
            <span key={s.id} className={i <= pos.story ? 'done' : ''} />
          ))}
        </div>
        <div className="story-meta">
          <b>{group.user.displayName}</b>
          <span>{timeAgo(story.createdAt)}</span>
        </div>
        {story.mediaType.startsWith('video/') ? (
          <video key={story.id} src={mediaUrl(story.mediaUrl)} autoPlay playsInline controls onEnded={next} />
        ) : (
          <img key={story.id} src={mediaUrl(story.mediaUrl)} alt={story.caption || 'Story'} />
        )}
        {story.caption && <p className="post-body">{story.caption}</p>}
        <div className="story-nav">
          <button className="btn" onClick={prev}>
            ← Previous
          </button>
          {group.user.id === user?.id && (
            <button className="btn danger-btn" onClick={remove}>
              Delete
            </button>
          )}
          <button className="btn btn-primary" onClick={next}>
            Next →
          </button>
        </div>
      </section>
    </div>
  );
}
