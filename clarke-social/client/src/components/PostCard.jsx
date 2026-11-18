import { Bookmark, MessageCircle, Repeat2, Share2 } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { formatDateTime, timeAgo } from '../utils/format';
import Avatar from './Avatar';
import LikeButton from './feed/LikeButton';
import PostBody from './feed/PostBody';
import PostMedia from './feed/PostMedia';
import PostMenu from './feed/PostMenu';

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

function Counts({ post: p, onComments }) {
  if (!p.likes && !p.comments && !p.shares && !p.reposts) return null;
  return (
    <div className="post-counts">
      {p.likes > 0 && <span>{plural(p.likes, 'like')}</span>}
      <span className="grow" />
      {p.comments > 0 && (
        <button type="button" className="btn-link post-count-link" onClick={onComments}>
          {plural(p.comments, 'comment')}
        </button>
      )}
      {p.reposts > 0 && <span>{plural(p.reposts, 'repost')}</span>}
      {p.shares > 0 && <span>{plural(p.shares, 'share')}</span>}
    </div>
  );
}

// The original post inside a repost.
function Quoted({ original }) {
  const { navigate } = useNavigation();
  return (
    <div className="post-quote">
      <button type="button" className="post-quote-head" onClick={() => navigate('post', { id: original.id })}>
        <span className="truncate">
          <b>{original.displayName}</b> <span className="text-muted">@{original.username}</span>
        </span>
        <span className="btn-link">View post</span>
      </button>
      <PostBody text={original.body} />
      <PostMedia url={original.mediaUrl} type={original.mediaType} />
    </div>
  );
}

export default function PostCard({ post: p, actions }) {
  const { navigate } = useNavigation();
  const name = p.displayName || p.username;
  const openMember = () => navigate('member', { id: p.userId });
  return (
    <article className="card post-card" data-post={p.id} aria-label={`Post by ${name}`}>
      <header className="post-head">
        <button type="button" className="avatar-button" onClick={openMember} aria-label={`Open ${name}'s profile`}>
          <Avatar src={p.avatar} name={name} size="md" />
        </button>
        <div className="post-author">
          <p className="post-author-line">
            <button type="button" className="post-author-name" onClick={openMember}>
              {name}
            </button>
            {p.original ? (
              <span className="post-feeling">
                <Repeat2 size={16} aria-hidden="true" /> reposted
              </span>
            ) : (
              p.feeling && <span className="post-feeling">is feeling {p.feeling}</span>
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
        <PostMenu post={p} actions={actions} />
      </header>
      <PostBody text={p.body} />
      <PostMedia url={p.mediaUrl} type={p.mediaType} />
      {p.original && <Quoted original={p.original} />}
      <Counts post={p} onComments={() => actions.comments(p)} />
      <div className="post-actions">
        <LikeButton post={p} onLike={actions.like}>
          <span className="post-action-label">Like</span>
        </LikeButton>
        <button type="button" className="post-action" aria-label="Open comments" onClick={() => actions.comments(p)}>
          <MessageCircle size={20} aria-hidden="true" />
          <span className="post-action-label">Comments</span>
        </button>
        <button type="button" className="post-action" aria-label="Share post" onClick={() => actions.share(p)}>
          <Share2 size={20} aria-hidden="true" />
          <span className="post-action-label">Share</span>
        </button>
        <button
          type="button"
          className={`post-action${p.saved ? ' saved' : ''}`}
          aria-label="Save post"
          aria-pressed={p.saved}
          onClick={() => actions.save(p)}
        >
          <Bookmark size={20} aria-hidden="true" fill={p.saved ? 'currentColor' : 'none'} />
          <span className="post-action-label">Save</span>
        </button>
      </div>
    </article>
  );
}
