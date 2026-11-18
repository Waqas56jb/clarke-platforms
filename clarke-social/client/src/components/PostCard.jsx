import { formatUtcTimestamp, initials } from '../utils/format';

export default function PostCard({ post: p, saved, onLike, onComments, onSave, onDownload, onReport }) {
  const isVideo = p.mediaType.startsWith('video/');
  return (
    <article className="post-card" data-post={p.id}>
      <div className="post-head">
        {p.avatar ? (
          <img className="avatar" src={p.avatar} alt="" />
        ) : (
          <div className="avatar avatar-purple">{initials(p.displayName)}</div>
        )}
        <div className="post-author">
          <b>{p.displayName || p.username}</b>
          <small>
            @{p.username} · {formatUtcTimestamp(p.createdAt)}
          </small>
        </div>
        <button className="post-menu" title="Report post" onClick={() => onReport(p.id)}>
          ···
        </button>
      </div>
      {p.body ? <div className="post-body">{p.body}</div> : null}
      {p.mediaUrl &&
        (isVideo ? (
          <video className="post-media" controls playsInline preload="metadata" src={p.mediaUrl}></video>
        ) : (
          <img className="post-media" loading="lazy" src={p.mediaUrl} alt="Post image" />
        ))}
      <div className="post-actions">
        <button className={`post-action ${p.liked ? 'liked' : ''}`} onClick={() => onLike(p.id)}>
          {p.liked ? '♥' : '♡'} <span>{p.likes}</span>
        </button>
        <button className="post-action" onClick={() => onComments(p.id)}>
          ▢ <span>{p.comments} comments</span>
        </button>
        <button className="post-action" onClick={() => onSave(p.id)}>
          {saved ? '★' : '☆'} Save
        </button>
        {isVideo && p.allowDownload ? (
          <button className="post-action post-download" onClick={() => onDownload(p.id)}>
            ↓ Download
          </button>
        ) : null}
      </div>
    </article>
  );
}
