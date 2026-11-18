import { mediaUrl } from '../services/http';
import { initials } from '../utils/format';

// Member photo when uploaded, otherwise initials. Sizes: xs 28, sm 36, md 44, lg 56, xl 80, xxl 120.
export default function Avatar({ src, name, size = 'md', className = '', alt = '' }) {
  const classes = `avatar avatar-${size} ${className}`.trim();
  if (src) return <img className={classes} src={mediaUrl(src)} alt={alt} loading="lazy" decoding="async" />;
  return (
    <span
      className={classes}
      aria-hidden={alt ? undefined : 'true'}
      aria-label={alt || undefined}
      role={alt ? 'img' : undefined}
    >
      {initials(name)}
    </span>
  );
}
