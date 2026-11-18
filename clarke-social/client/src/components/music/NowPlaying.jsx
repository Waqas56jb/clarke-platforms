import { useEffect, useRef, useState } from 'react';
import { formatSeconds } from '../../utils/format';

export default function NowPlaying({ track }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState({ current: 0, duration: 0 });
  const [shownTrack, setShownTrack] = useState(track);

  // A newly chosen track starts playing and flips the button to pause, as in the original.
  if (track !== shownTrack) {
    setShownTrack(track);
    if (track?.src) setPlaying(true);
  }

  useEffect(() => {
    const audio = audioRef.current;
    if (!track?.src) return;
    audio.src = track.src;
    audio.play().catch(() => {});
  }, [track]);

  useEffect(() => () => track?.src && URL.revokeObjectURL(track.src), [track]);

  const onPlay = () => {
    const audio = audioRef.current;
    if (!audio.src) {
      alert('Choose a local audio file first, or select an approved catalogue track.');
      return;
    }
    if (audio.paused) {
      audio.play();
      setPlaying(true);
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  const onTimeUpdate = () => {
    const audio = audioRef.current;
    setTime({ current: audio.currentTime || 0, duration: audio.duration || 0 });
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
      <p id="musicNowArtist">{track?.artist || 'Your Clarke listening room'}</p>
      <audio
        id="clarkeAudio"
        ref={audioRef}
        controls
        style={{ width: '100%', height: 35, filter: 'invert(1) hue-rotate(180deg)', marginTop: 8 }}
        onTimeUpdate={onTimeUpdate}
      ></audio>
      <div className="music-controls">
        <button id="musicPrev" title="Previous" onClick={() => (audioRef.current.currentTime = 0)}>
          |◀
        </button>
        <button className="play-main" id="musicPlay" title="Play or pause" onClick={onPlay}>
          {playing ? 'Ⅱ' : '▶'}
        </button>
        <button
          id="musicNext"
          title="Next"
          onClick={() => alert('Queue controls connect to the approved music catalogue in production.')}
        >
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
        High-quality playback interface preview. Select an audio file in the upload panel to audition it locally; this
        preview does not publish or store music.
      </p>
    </section>
  );
}
