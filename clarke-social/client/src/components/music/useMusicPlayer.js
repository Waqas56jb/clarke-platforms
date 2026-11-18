import { useCallback, useEffect, useRef, useState } from 'react';
import { mediaUrl } from '../../services/http';

// Drives the single <audio> element for Clarke Music. The full player and the mobile mini-player share it.
// queue: tracks; index: current position; onIndexChange(i) moves through the queue.
export function useMusicPlayer(queue, index, onIndexChange) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState({ current: 0, duration: 0 });
  const [volume, setVolumeState] = useState(1);
  const track = queue[index];
  const src = track ? mediaUrl(track.audioUrl) : '';

  // Keyed on the URL so liking the current track (a new object) doesn't restart it.
  useEffect(() => {
    const audio = audioRef.current;
    if (!src || !audio) return;
    audio.src = src;
    audio.play().catch(() => {});
  }, [src]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !src) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  }, [src]);

  const move = useCallback(
    (step) => {
      if (!queue.length) return;
      onIndexChange((index + step + queue.length) % queue.length);
    },
    [queue.length, index, onIndexChange]
  );

  const seek = useCallback((percent) => {
    const audio = audioRef.current;
    if (audio?.duration) audio.currentTime = (audio.duration * percent) / 100;
  }, []);

  const setVolume = useCallback((value) => {
    if (audioRef.current) audioRef.current.volume = value;
    setVolumeState(value);
  }, []);

  const audioProps = {
    ref: audioRef,
    onPlay: () => setPlaying(true),
    onPause: () => setPlaying(false),
    onEnded: () => move(1),
    onTimeUpdate: (e) => setTime({ current: e.target.currentTime || 0, duration: e.target.duration || 0 }),
    onLoadedMetadata: (e) => setTime({ current: 0, duration: e.target.duration || 0 }),
  };

  return { track, index, total: queue.length, playing, time, volume, toggle, move, seek, setVolume, audioProps };
}
