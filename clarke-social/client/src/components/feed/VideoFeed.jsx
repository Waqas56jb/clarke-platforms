import { useCallback, useState } from 'react';
import VideoSlide from './VideoSlide';

// Vertical, snap-scrolling video feed (full height on phones, a centred column on larger screens).
// Only the visible video plays; only it and the next one are preloaded. Videos start muted so they
// can autoplay; the rail's sound button unmutes them all.
export default function VideoFeed({ posts, actions }) {
  const [active, setActive] = useState(0);
  const [muted, setMuted] = useState(true);
  const onVisible = useCallback((i) => setActive(i), []);
  const toggleMute = useCallback(() => setMuted((m) => !m), []);

  return (
    <div className="video-feed">
      {posts.map((p, i) => (
        <VideoSlide
          key={p.id}
          post={p}
          index={i}
          active={i === active}
          preload={i === active ? 'auto' : i === active + 1 ? 'metadata' : 'none'}
          muted={muted}
          onMuteToggle={toggleMute}
          onVisible={onVisible}
          actions={actions}
        />
      ))}
    </div>
  );
}
