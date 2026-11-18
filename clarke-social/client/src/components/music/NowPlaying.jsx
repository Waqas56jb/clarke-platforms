import { useEffect, useRef, useState } from 'react';
import { mediaUrl } from '../../services/http';
import { formatSeconds } from '../../utils/format';

// Plays `queue[index]`; previous/next move through the queue.
export default function NowPlaying({ queue, index, onIndexChange }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState({ current: 0, duration: 0 });
  const track = queue[index];

  useEffect(() => {
    const audio = audioRef.current;
    if (!track) return;
    audio.src = mediaUrl(track.audioUrl);
    audio.play().catch(() => {});
  }, [track]);

  const onPlay = () => {
    const audio = audioRef.current;
    if (!track) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  };

  const move = (step) => {
    if (!queue.length) return;
    onIndexChange((index + step + queue.length) % queue.length);
  };

  const onSeek = (e) => {
    const audio = audioRef.current;
    if (audio.duration) audio.currentTime = (audio.duration * Number(e.target.value)) / 100;
  };

  const progress = time.duration ? (time.current / time.duration) * 100 : 0;

  return (
    <section className="music-now">
      <div className="music-now-art" id="musicNowArt">
        ♫
      </div>
      <span className="eyebrow">NOW PLAYING</span>
      <h3 id="musicNowTitle">{track?.title || 'Choose a track'}</h3>
      <p id="musicNowArtist">
        {track ? `${track.artist} · uploaded by ${track.ownerName}` : 'Your Clarke listening room'}
      </p>
      <audio
        id="clarkeAudio"
        ref={audioRef}
        controls
        style={{ width: '100%', height: 35, filter: 'invert(1) hue-rotate(180deg)', marginTop: 8 }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => move(1)}
        onTimeUpdate={(e) => setTime({ current: e.target.currentTime || 0, duration: e.target.duration || 0 })}
      ></audio>
      <div className="music-controls">
        <button id="musicPrev" title="Previous" onClick={() => move(-1)} disabled={!track}>
          |◀
        </button>
        <button className="play-main" id="musicPlay" title="Play or pause" onClick={onPlay} disabled={!track}>
          {playing ? 'Ⅱ' : '▶'}
        </button>
        <button id="musicNext" title="Next" onClick={() => move(1)} disabled={!track}>
          ▶|
        </button>
      </div>
      <div className="music-time">
        <span id="musicElapsed">{formatSeconds(time.current)}</span>
        <span id="musicDuration">{time.duration ? formatSeconds(time.duration) : '--:--'}</span>
      </div>
      <input
        className="music-progress"
        id="musicSeek"
        type="range"
        min="0"
        max="100"
        value={progress}
        aria-label="Seek track"
        onChange={onSeek}
      />
      <p className="music-status" style={{ color: '#c5d5f2' }}>
        {track ? `${index + 1} of ${queue.length} in this queue.` : 'Pick a track or playlist to start listening.'}
      </p>
    </section>
  );
}
