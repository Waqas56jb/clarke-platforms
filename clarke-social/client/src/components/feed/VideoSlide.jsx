import { useEffect, useRef, useState } from 'react';
import { Bookmark, CircleAlert, MessageCircle, Play, Share2, Volume2, VolumeX } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import { mediaUrl } from '../../services/http';
import { timeAgo } from '../../utils/format';
import Avatar from '../Avatar';
import LikeButton from './LikeButton';
import PostBody from './PostBody';
import PostMenu from './PostMenu';

const VISIBLE_RATIO = 0.6;

// One video in the Videos feed: plays while it is the visible one, with the action rail beside it.
export default function VideoSlide({ post: p, index, active, preload, muted, onMuteToggle, onVisible, actions }) {
  const { navigate } = useNavigation();
  const ref = useRef(null);
  const videoRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState(false);
  const name = p.displayName || p.username;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.intersectionRatio >= VISIBLE_RATIO && onVisible(index),
      { threshold: [VISIBLE_RATIO] }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [index, onVisible]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (active && !paused) video.play().catch(() => {});
    else video.pause();
  }, [active, paused]);

  return (
    <article className="video-slide" ref={ref} aria-label={`Video by ${name}`} data-post={p.id}>
      <div className="video-stage">
        {failed ? (
          <p className="media-error" role="alert">
            <CircleAlert size={20} aria-hidden="true" /> This video couldn&apos;t be played.
          </p>
        ) : (
          <video
            ref={videoRef}
            src={mediaUrl(p.mediaUrl)}
            preload={preload}
            muted={muted}
            loop
            playsInline
            onClick={() => setPaused((x) => !x)}
            onError={() => setFailed(true)}
          />
        )}
        {paused && !failed && (
          <button type="button" className="video-play" onClick={() => setPaused(false)} aria-label="Play video">
            <Play size={40} aria-hidden="true" fill="currentColor" />
          </button>
        )}
      </div>
      <div className="video-rail">
        <LikeButton post={p} onLike={actions.like} className="video-rail-btn">
          <span>{p.likes}</span>
        </LikeButton>
        <button type="button" className="video-rail-btn" aria-label="Open comments" onClick={() => actions.comments(p)}>
          <MessageCircle size={24} aria-hidden="true" />
          <span>{p.comments}</span>
        </button>
        <button type="button" className="video-rail-btn" aria-label="Share post" onClick={() => actions.share(p)}>
          <Share2 size={24} aria-hidden="true" />
          <span>{p.shares || 'Share'}</span>
        </button>
        <button
          type="button"
          className={`video-rail-btn${p.saved ? ' saved' : ''}`}
          aria-label="Save post"
          aria-pressed={p.saved}
          onClick={() => actions.save(p)}
        >
          <Bookmark size={24} aria-hidden="true" fill={p.saved ? 'currentColor' : 'none'} />
          <span>Save</span>
        </button>
        <button
          type="button"
          className="video-rail-btn"
          aria-label={muted ? 'Unmute videos' : 'Mute videos'}
          onClick={onMuteToggle}
        >
          {muted ? <VolumeX size={24} aria-hidden="true" /> : <Volume2 size={24} aria-hidden="true" />}
        </button>
        <PostMenu post={p} actions={actions} className="video-rail-btn post-menu" direction="up" />
      </div>
      <div className="video-info">
        <button type="button" className="video-creator" onClick={() => navigate('member', { id: p.userId })}>
          <Avatar src={p.avatar} name={name} size="sm" />
          <span className="truncate">
            <b>{name}</b> @{p.username}
          </span>
        </button>
        <PostBody text={p.body} className="video-caption" />
        <time className="video-time" dateTime={p.createdAt}>
          {timeAgo(p.createdAt)}
        </time>
      </div>
    </article>
  );
}
