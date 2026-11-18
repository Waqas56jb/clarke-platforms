import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { mediaUrl } from '../services/http';
import { formatDateTime } from '../utils/format';
import Avatar from './Avatar';

function Media({ url, type }) {
  if (!url) return null;
  return type.startsWith('video/') ? (
    <video className="post-media" controls playsInline preload="metadata" src={mediaUrl(url)}></video>
  ) : (
    <img className="post-media" loading="lazy" src={mediaUrl(url)} alt="Post image" />
  );
}

export default function PostCard({ post: p, actions }) {
  const { user } = useAuth();
  const { navigate } = useNavigation();
  const isVideo = p.mediaType.startsWith('video/');
  const mine = user?.id === p.userId;
  return (
    <article className="post-card" data-post={p.id}>
      <div className="post-head">
        <Avatar src={p.avatar} name={p.displayName} />
        <div className="post-author" style={{ cursor: 'pointer' }} onClick={() => navigate('member', { id: p.userId })}>
          <b>{p.displayName || p.username}</b>
          {p.feeling && <span className="post-feeling"> is feeling {p.feeling}</span>}
          {p.original && <span className="post-feeling"> reposted</span>}
          <small>
            @{p.username} · {formatDateTime(p.createdAt)}
          </small>
        </div>
        <button
          className="post-menu"
          title={mine ? 'Delete post' : 'Report post'}
          onClick={() => (mine ? actions.remove(p) : actions.report(p))}
        >
          ···
        </button>
      </div>
      {p.body ? <div className="post-body">{p.body}</div> : null}
      <Media url={p.mediaUrl} type={p.mediaType} />
      {p.original && (
        <div
          className="card-panel"
          style={{ padding: 12, margin: '10px 0', cursor: 'pointer' }}
          onClick={() => navigate('post', { id: p.original.id })}
        >
          <small className="dating-muted">
            {p.original.displayName} · @{p.original.username}
          </small>
          {p.original.body && <div className="post-body">{p.original.body}</div>}
          <Media url={p.original.mediaUrl} type={p.original.mediaType} />
        </div>
      )}
      <div className="post-actions">
        <button className={`post-action ${p.liked ? 'liked' : ''}`} onClick={() => actions.like(p)}>
          {p.liked ? '♥' : '♡'} <span>{p.likes}</span>
        </button>
        <button className="post-action" onClick={() => actions.comments(p)}>
          ▢ <span>{p.comments} comments</span>
        </button>
        <button className="post-action" onClick={() => actions.save(p)}>
          {p.saved ? '★' : '☆'} Save
        </button>
        <button className="post-action" onClick={() => actions.share(p)}>
          ↗ <span>{p.shares ? `${p.shares} ` : ''}Share</span>
        </button>
        {isVideo && (p.allowDownload || mine) ? (
          <button className="post-action post-download" onClick={() => actions.download(p)}>
            ↓ Download
          </button>
        ) : null}
      </div>
    </article>
  );
}
