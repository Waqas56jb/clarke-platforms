import { useState } from 'react';
import { CircleAlert } from 'lucide-react';
import { mediaUrl } from '../../services/http';
import MediaViewer from './MediaViewer';

// A post photo (natural aspect ratio, opens full screen) or an inline video player.
export default function PostMedia({ url, type = '', alt = 'Post photo' }) {
  const [ratio, setRatio] = useState(null);
  const [viewing, setViewing] = useState(false);
  const [failed, setFailed] = useState(false);
  if (!url) return null;
  const src = mediaUrl(url);

  if (type.startsWith('video/'))
    return (
      <div className="post-media post-media-video">
        {failed ? (
          <p className="media-error" role="alert">
            <CircleAlert size={20} aria-hidden="true" /> This video couldn&apos;t be played.
          </p>
        ) : (
          <video controls playsInline preload="metadata" src={src} onError={() => setFailed(true)} />
        )}
      </div>
    );

  return (
    <>
      <button
        type="button"
        className="post-media post-media-image"
        onClick={() => setViewing(true)}
        aria-label="View photo full screen"
        style={ratio ? { aspectRatio: ratio } : undefined}
      >
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={(e) => setRatio(`${e.currentTarget.naturalWidth} / ${e.currentTarget.naturalHeight}`)}
        />
      </button>
      {viewing && <MediaViewer src={src} alt={alt} onClose={() => setViewing(false)} />}
    </>
  );
}
