import { useState } from 'react';
import { Heart } from 'lucide-react';

// Like toggle with the filled heart and a short pop when a post is liked.
export default function LikeButton({ post, onLike, className = 'post-action', children }) {
  const [pop, setPop] = useState(false);
  return (
    <button
      type="button"
      className={`${className}${post.liked ? ' liked' : ''}`}
      aria-label={post.liked ? 'Unlike post' : 'Like post'}
      onClick={() => {
        if (!post.liked) setPop(true);
        onLike(post);
      }}
    >
      <Heart
        size={20}
        aria-hidden="true"
        fill={post.liked ? 'currentColor' : 'none'}
        className={pop ? 'like-pop' : undefined}
        onAnimationEnd={() => setPop(false)}
      />
      {children}
    </button>
  );
}
