import { Music, Pause, Play, SkipForward } from 'lucide-react';

// Mobile-only bar pinned above the bottom tab bar while a track is loaded.
export default function MiniPlayer({ player, onOpen }) {
  const { track, playing, time } = player;
  if (!track) return null;
  const progress = time.duration ? (time.current / time.duration) * 100 : 0;
  return (
    <div className="music-mini" role="region" aria-label="Mini player">
      <div className="music-mini-progress" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>
      <button type="button" className="music-mini-info" onClick={onOpen} aria-label={`Open player: ${track.title}`}>
        <span className="music-art music-art-sm" aria-hidden="true">
          <Music size={18} />
        </span>
        <span className="list-row-main">
          <span className="list-row-title">{track.title}</span>
          <span className="list-row-sub">{track.artist}</span>
        </span>
      </button>
      <button type="button" className="icon-btn" aria-label={playing ? 'Pause' : 'Play'} onClick={player.toggle}>
        {playing ? <Pause size={22} aria-hidden="true" /> : <Play size={22} aria-hidden="true" />}
      </button>
      <button type="button" className="icon-btn" aria-label="Next track" onClick={() => player.move(1)}>
        <SkipForward size={22} aria-hidden="true" />
      </button>
    </div>
  );
}
