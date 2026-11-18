import { Music, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { formatSeconds } from '../../utils/format';

// Full player card. `player` comes from useMusicPlayer; this component owns the <audio> element.
export default function NowPlaying({ player }) {
  const { track, index, total, playing, time, volume } = player;
  const progress = time.duration ? (time.current / time.duration) * 100 : 0;

  return (
    <section className="card music-now" aria-labelledby="musicNowTitle">
      <div className={`music-now-art${playing ? ' is-playing' : ''}`} id="musicNowArt" aria-hidden="true">
        <Music size={48} />
      </div>
      <div className="music-now-info">
        <p className="music-now-label">Now playing</p>
        <h2 id="musicNowTitle">{track?.title || 'Choose a track'}</h2>
        <p id="musicNowArtist">
          {track ? `${track.artist} · uploaded by ${track.ownerName}` : 'Your Clarke listening room'}
        </p>
      </div>
      <input
        className="music-seek"
        id="musicSeek"
        type="range"
        min="0"
        max="100"
        step="0.1"
        value={progress}
        aria-label="Seek track"
        aria-valuetext={`${formatSeconds(time.current)} of ${time.duration ? formatSeconds(time.duration) : 'unknown'}`}
        onChange={(e) => player.seek(Number(e.target.value))}
        disabled={!track}
      />
      <div className="music-time">
        <span id="musicElapsed">{formatSeconds(time.current)}</span>
        <span id="musicDuration">{time.duration ? formatSeconds(time.duration) : '--:--'}</span>
      </div>
      <div className="music-controls">
        <button
          type="button"
          className="icon-btn"
          id="musicPrev"
          aria-label="Previous track"
          onClick={() => player.move(-1)}
          disabled={!track}
        >
          <SkipBack size={22} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="music-play-main"
          id="musicPlay"
          aria-label={playing ? 'Pause' : 'Play'}
          onClick={player.toggle}
          disabled={!track}
        >
          {playing ? <Pause size={24} aria-hidden="true" /> : <Play size={24} aria-hidden="true" />}
        </button>
        <button
          type="button"
          className="icon-btn"
          id="musicNext"
          aria-label="Next track"
          onClick={() => player.move(1)}
          disabled={!track}
        >
          <SkipForward size={22} aria-hidden="true" />
        </button>
      </div>
      <label className="music-volume">
        {volume === 0 ? <VolumeX size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}
        <span className="sr-only">Volume</span>
        <input
          id="musicVolume"
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) => player.setVolume(Number(e.target.value))}
        />
      </label>
      <p className="caption music-queue-status" aria-live="polite">
        {track ? `${index + 1} of ${total} in this queue.` : 'Pick a track or playlist to start listening.'}
      </p>
      <audio id="clarkeAudio" preload="metadata" {...player.audioProps} />
    </section>
  );
}
