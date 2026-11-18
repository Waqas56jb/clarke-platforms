import { initials } from '../utils/format';

// Initials avatar. Sizes: sm 36, md 44, lg 56.
export default function Avatar({ name, size = 'md' }) {
  return (
    <span className={`avatar avatar-${size}`} aria-hidden="true">
      {initials(name)}
    </span>
  );
}
