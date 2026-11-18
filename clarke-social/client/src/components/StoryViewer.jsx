import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, CircleAlert, Send, Trash2, Volume2, VolumeX, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import { mediaUrl } from '../services/http';
import { sendMessage } from '../services/messagesService';
import { deleteStory } from '../services/storiesService';
import { timeAgo } from '../utils/format';
import { useScrollLock } from './ui/Dialog';
import Avatar from './Avatar';
import { useConfirm } from './ui/ConfirmDialog';

const PHOTO_MS = 5000;
const HOLD_MS = 220;
const SWIPE_PX = 50;
const SWIPE_CLOSE_PX = 80;
const TAP_PX = 10;
const FOCUSABLE = 'button:not([disabled]), input:not([disabled])';

// Full-screen story player: every active story in order, moving on to the next member automatically.
// Tap left/right or swipe to navigate, swipe down to close, press and hold to pause.
export default function StoryViewer({ groups, startIndex, onClose, onDeleted, onSeen }) {
  const { user } = useAuth();
  const { navigate } = useNavigation();
  const { confirm } = useConfirm();
  const toast = useToast();
  const [pos, setPos] = useState({ group: startIndex, story: 0 });
  const [progress, setProgress] = useState(0);
  const [held, setHeld] = useState(false);
  const [typing, setTyping] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [muted, setMuted] = useState(false);
  const [loadedId, setLoadedId] = useState(null);
  const [failedId, setFailedId] = useState(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const rootRef = useRef(null);
  const closeRef = useRef(null);
  const videoRef = useRef(null);
  const elapsed = useRef(0);
  const gesture = useRef(null);

  const group = groups[pos.group];
  const story = group?.stories[pos.story];
  const isVideo = Boolean(story?.mediaType.startsWith('video/'));
  const own = group?.user.id === user?.id;
  const failed = failedId === story?.id;
  const paused = held || typing || confirming || (!isVideo && loadedId !== story?.id && !failed);

  const goTo = useCallback((g, s) => {
    elapsed.current = 0;
    setProgress(0);
    setPos({ group: g, story: s });
  }, []);

  const next = useCallback(() => {
    if (pos.story + 1 < groups[pos.group].stories.length) goTo(pos.group, pos.story + 1);
    else if (pos.group + 1 < groups.length) goTo(pos.group + 1, 0);
    else onClose();
  }, [pos, groups, goTo, onClose]);

  const prev = useCallback(() => {
    if (pos.story > 0) goTo(pos.group, pos.story - 1);
    else if (pos.group > 0) goTo(pos.group - 1, 0);
    else {
      goTo(pos.group, 0);
      if (videoRef.current) videoRef.current.currentTime = 0;
    }
  }, [pos, goTo]);

  useEffect(() => {
    if (story) onSeen?.(story.id);
  }, [story, onSeen]);

  // Photos advance after 5 seconds of (unpaused) viewing.
  useEffect(() => {
    if (!story || isVideo || paused) return undefined;
    let last = performance.now();
    let frame;
    const tick = (now) => {
      elapsed.current += now - last;
      last = now;
      const value = Math.min(1, elapsed.current / PHOTO_MS);
      setProgress(value);
      if (value >= 1) next();
      else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [story, isVideo, paused, next]);

  // Videos follow their own playback; browsers that block sound get a muted start.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (paused) {
      video.pause();
      return;
    }
    video.play().catch(() => {
      video.muted = true;
      setMuted(true);
      video.play().catch(() => {});
    });
  }, [paused, story]);

  // Initial focus, focus restore, keyboard navigation and a simple focus trap.
  useScrollLock();
  useEffect(() => {
    const opener = document.activeElement;
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    if (confirming) return undefined;
    const onKey = (e) => {
      const inField = e.target.tagName === 'INPUT';
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight' && !inField) next();
      else if (e.key === 'ArrowLeft' && !inField) prev();
      else if (e.key === 'Tab') {
        const items = [...rootRef.current.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
        const [head, tail] = [items[0], items[items.length - 1]];
        if (e.shiftKey && document.activeElement === head) {
          e.preventDefault();
          tail.focus();
        } else if (!e.shiftKey && document.activeElement === tail) {
          e.preventDefault();
          head.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [confirming, next, prev, onClose]);

  if (!story) return null;

  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    const g = { x: e.clientX, y: e.clientY, held: false };
    g.timer = setTimeout(() => {
      g.held = true;
      setHeld(true);
    }, HOLD_MS);
    gesture.current = g;
  };
  const onPointerMove = (e) => {
    const g = gesture.current;
    if (g && !g.held && Math.hypot(e.clientX - g.x, e.clientY - g.y) > TAP_PX) clearTimeout(g.timer);
  };
  const onPointerUp = (e) => {
    const g = gesture.current;
    if (!g) return;
    clearTimeout(g.timer);
    gesture.current = null;
    if (g.held) return setHeld(false);
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (dy > SWIPE_CLOSE_PX && dy > Math.abs(dx)) return onClose();
    if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy)) return dx < 0 ? next() : prev();
    if (Math.abs(dx) < TAP_PX && Math.abs(dy) < TAP_PX) {
      const rect = e.currentTarget.getBoundingClientRect();
      if (e.clientX - rect.left < rect.width / 3) prev();
      else next();
    }
  };
  const onPointerCancel = () => {
    clearTimeout(gesture.current?.timer);
    gesture.current = null;
    setHeld(false);
  };

  const remove = async () => {
    setConfirming(true);
    const ok = await confirm({
      title: 'Delete this story?',
      message: 'It will be removed for everyone straight away.',
      confirmLabel: 'Delete',
      danger: true,
    });
    setConfirming(false);
    if (!ok) return;
    try {
      await deleteStory(story.id);
      toast('Story deleted.', 'success');
      onDeleted();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const sendReply = async (e) => {
    e.preventDefault();
    const text = reply.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      await sendMessage(group.user.id, `Replied to your story: ${text}`);
      setReply('');
      toast('Reply sent.', 'success');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSending(false);
    }
  };

  const openAuthor = () => {
    onClose();
    navigate('member', { id: group.user.id });
  };

  return createPortal(
    <div
      className="story-viewer"
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Story by ${group.user.displayName}`}
    >
      <button type="button" className="story-step story-step-prev" onClick={prev} aria-label="Previous story">
        <ChevronLeft size={24} aria-hidden="true" />
      </button>
      <div className="story-frame">
        <div className="story-progress" aria-hidden="true">
          {group.stories.map((s, i) => (
            <span key={s.id} className="story-progress-track">
              <span
                className={`story-progress-fill${isVideo ? ' is-video' : ''}`}
                style={{ width: `${i < pos.story ? 100 : i === pos.story ? progress * 100 : 0}%` }}
              />
            </span>
          ))}
        </div>
        <div className="story-top">
          <button type="button" className="story-author" onClick={openAuthor}>
            <Avatar src={group.user.avatar} name={group.user.displayName} size="sm" />
            <span className="story-author-text">
              <b className="truncate">{group.user.displayName}</b>
              <time dateTime={story.createdAt}>{timeAgo(story.createdAt)}</time>
            </span>
          </button>
          {isVideo && (
            <button
              type="button"
              className="icon-btn story-icon"
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? 'Unmute story' : 'Mute story'}
            >
              {muted ? <VolumeX size={20} aria-hidden="true" /> : <Volume2 size={20} aria-hidden="true" />}
            </button>
          )}
          {own && (
            <button type="button" className="icon-btn story-icon" onClick={remove} aria-label="Delete story">
              <Trash2 size={20} aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            className="icon-btn story-icon"
            ref={closeRef}
            onClick={onClose}
            aria-label="Close story"
          >
            <X size={24} aria-hidden="true" />
          </button>
        </div>

        <div
          className="story-stage"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          onContextMenu={(e) => e.preventDefault()}
        >
          {failed ? (
            <p className="media-error" role="alert">
              <CircleAlert size={20} aria-hidden="true" />
              {isVideo ? "This video couldn't be played." : "This story couldn't be loaded."}
            </p>
          ) : isVideo ? (
            <video
              key={story.id}
              ref={videoRef}
              src={mediaUrl(story.mediaUrl)}
              playsInline
              muted={muted}
              preload="auto"
              onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime / (e.currentTarget.duration || 1))}
              onEnded={next}
              onError={() => setFailedId(story.id)}
            />
          ) : (
            <img
              key={story.id}
              src={mediaUrl(story.mediaUrl)}
              alt={story.caption || `Story by ${group.user.displayName}`}
              draggable={false}
              onLoad={() => setLoadedId(story.id)}
              onError={() => setFailedId(story.id)}
            />
          )}
        </div>

        {story.caption && <p className="story-caption">{story.caption}</p>}

        {!own && user && (
          <form className="story-reply" onSubmit={sendReply}>
            <label className="sr-only" htmlFor="storyReply">
              Reply to {group.user.displayName}
            </label>
            <input
              id="storyReply"
              value={reply}
              maxLength={500}
              placeholder={`Reply to ${group.user.displayName}…`}
              onChange={(e) => setReply(e.target.value)}
              onFocus={() => setTyping(true)}
              onBlur={() => setTyping(false)}
              autoComplete="off"
            />
            <button
              type="submit"
              className="icon-btn story-icon"
              aria-label="Send reply"
              disabled={!reply.trim() || sending}
            >
              {sending ? <span className="spinner" aria-hidden="true" /> : <Send size={20} aria-hidden="true" />}
            </button>
          </form>
        )}
      </div>
      <button type="button" className="story-step story-step-next" onClick={next} aria-label="Next story">
        <ChevronRight size={24} aria-hidden="true" />
      </button>
    </div>,
    document.body
  );
}
