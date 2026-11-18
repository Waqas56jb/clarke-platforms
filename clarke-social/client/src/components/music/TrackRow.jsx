import { AudioLines, Flag, Heart, ListPlus, MoreHorizontal, Music, Pause, Play, Trash2 } from 'lucide-react';
import Menu from '../ui/Menu';

// One catalogue row. `current` = loaded in the player, `playing` = current and not paused.
export default function TrackRow({
  track: t,
  current,
  playing,
  playlists,
  mine,
  onPlay,
  onLike,
  onAdd,
  onDelete,
  onReport,
}) {
  const menuItems = [
    ...playlists.map((p) => ({
      label: `Add to “${p.name}”`,
      icon: <ListPlus size={20} aria-hidden="true" />,
      onSelect: () => onAdd(p.id),
    })),
    { separator: true, hidden: !playlists.length },
    {
      label: 'Delete track',
      icon: <Trash2 size={20} aria-hidden="true" />,
      onSelect: onDelete,
      danger: true,
      hidden: !mine,
    },
    { label: 'Report track', icon: <Flag size={20} aria-hidden="true" />, onSelect: onReport, hidden: mine },
  ];

  return (
    <li className={`music-track${current ? ' playing' : ''}`} aria-current={current ? 'true' : undefined}>
      <button
        type="button"
        className="music-art music-play-btn"
        aria-label={playing ? `Pause ${t.title}` : `Play ${t.title}`}
        onClick={onPlay}
      >
        <span className="music-art-idle" aria-hidden="true">
          {current ? <AudioLines size={20} /> : <Music size={20} />}
        </span>
        <span className="music-art-action" aria-hidden="true">
          {playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
        </span>
      </button>
      <div className="music-track-info">
        <p className="music-track-title">{t.title}</p>
        <p className="music-track-meta">
          <span className="truncate">{t.artist}</span>
          <span className="badge badge-neutral">{t.rightsCategory === 'original' ? 'Original' : 'Licensed'}</span>
          <span className="music-likes">
            <Heart size={12} aria-hidden="true" />
            <span className="sr-only">Likes:</span> {t.likes}
          </span>
        </p>
      </div>
      <div className="track-actions">
        <button
          type="button"
          className={`icon-btn like-btn${t.liked ? ' liked' : ''}`}
          aria-label={t.liked ? 'Unlike track' : 'Like track'}
          onClick={onLike}
        >
          <Heart size={20} aria-hidden="true" fill={t.liked ? 'currentColor' : 'none'} />
        </button>
        <Menu
          label={`More actions for ${t.title}`}
          trigger={<MoreHorizontal size={20} aria-hidden="true" />}
          items={menuItems}
        />
      </div>
    </li>
  );
}
