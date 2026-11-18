import { useRef, useState } from 'react';
import { Ban, Flag, Heart, MapPin, MoreHorizontal, X } from 'lucide-react';
import { initials } from '../../utils/format';
import Menu from '../ui/Menu';

const SWIPE_PX = 100;

const interestList = (text) =>
  (text || '')
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8);

// Drag the photo sideways: right likes, left passes. The buttons and arrow keys do the same.
function useSwipe(onLike, onPass) {
  const startRef = useRef(null);
  const [dx, setDx] = useState(0);

  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    startRef.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (startRef.current !== null) setDx(e.clientX - startRef.current);
  };
  const onPointerUp = () => {
    if (startRef.current === null) return;
    startRef.current = null;
    setDx(0);
    if (dx > SWIPE_PX) onLike();
    else if (dx < -SWIPE_PX) onPass();
  };
  return { dx, handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp } };
}

export default function DatingCard({ profile: p, busy, onLike, onPass, onReport, onBlock }) {
  const name = p.display_name;
  const { dx, handlers } = useSwipe(onLike, onPass);
  const interests = interestList(p.interests);
  const strength = Math.min(1, Math.abs(dx) / SWIPE_PX);

  const onKeyDown = (e) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'ArrowRight') onLike();
    if (e.key === 'ArrowLeft') onPass();
  };

  return (
    <article
      className={`dating-card${dx ? ' is-dragging' : ''}`}
      tabIndex={0}
      aria-label={`${name}, ${p.age}. Press the right arrow to like or the left arrow to pass.`}
      onKeyDown={onKeyDown}
      style={dx ? { transform: `translateX(${dx}px) rotate(${dx / 24}deg)` } : undefined}
    >
      <div className="dating-photo-wrap" {...handlers}>
        {p.photo_url ? (
          <img className="dating-photo" src={p.photo_url} alt={`Photo of ${name}`} draggable={false} />
        ) : (
          <div className="dating-photo dating-placeholder" aria-hidden="true">
            {initials(name)}
          </div>
        )}
        <span className="dating-stamp dating-stamp-like" style={{ opacity: dx > 0 ? strength : 0 }} aria-hidden="true">
          Like
        </span>
        <span className="dating-stamp dating-stamp-pass" style={{ opacity: dx < 0 ? strength : 0 }} aria-hidden="true">
          Pass
        </span>
        <div className="dating-band">
          <h2 className="truncate">
            {name}
            {p.age > 0 && <span>, {p.age}</span>}
          </h2>
          {p.location && (
            <p className="truncate">
              <MapPin size={16} aria-hidden="true" />
              {p.location}
            </p>
          )}
        </div>
      </div>
      <div className="dating-card-body">
        {p.likesYou && (
          <span className="badge badge-success dating-hint">
            <Heart size={12} fill="currentColor" aria-hidden="true" />
            Likes you
          </span>
        )}
        {p.dating_bio && <p className="dating-bio">{p.dating_bio}</p>}
        {interests.length > 0 && (
          <ul className="dating-interests" aria-label="Interests">
            {interests.map((i) => (
              <li className="chip" key={i}>
                {i}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="dating-actions">
        <button type="button" className="dating-action dating-pass" aria-label="Pass" onClick={onPass}>
          <X size={28} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="dating-action dating-like"
          aria-label={`Like ${name}`}
          onClick={onLike}
          disabled={busy}
        >
          {busy ? <span className="spinner" aria-hidden="true" /> : <Heart size={28} aria-hidden="true" />}
        </button>
        <Menu
          label="More options"
          trigger={<MoreHorizontal size={20} aria-hidden="true" />}
          className="dating-action dating-more"
          direction="up"
          items={[
            { label: 'Report', icon: <Flag size={20} aria-hidden="true" />, onSelect: onReport },
            { label: 'Block', icon: <Ban size={20} aria-hidden="true" />, onSelect: onBlock, danger: true },
          ]}
        />
      </div>
    </article>
  );
}
