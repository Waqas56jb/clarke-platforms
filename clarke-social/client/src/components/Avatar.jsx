import { mediaUrl } from '../services/http';
import { initials } from '../utils/format';

// Member photo when one is uploaded, otherwise the coloured initials circle from the design.
export default function Avatar({ src, name, color = 'avatar-purple', className = '' }) {
  if (src) return <img className={`avatar ${className}`} src={mediaUrl(src)} alt="" />;
  return <div className={`avatar ${color} ${className}`}>{initials(name)}</div>;
}
