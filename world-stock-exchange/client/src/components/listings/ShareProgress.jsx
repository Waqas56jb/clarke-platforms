import { count } from '../../utils/format';

// Remaining shares of a listing as text and a bar.
export default function ShareProgress({ remaining, total }) {
  const sold = total > 0 ? Math.round(((total - remaining) / total) * 100) : 0;
  return (
    <div className="share-progress">
      <div className="row">
        <span className="grow text-sm">
          <b>{count(remaining)}</b> of {count(total)} shares available
        </span>
        <span className="caption">{sold}% sold</span>
      </div>
      <div
        className="progress progress-gold"
        role="progressbar"
        aria-label="Shares sold"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={sold}
      >
        <span style={{ width: `${sold}%` }} />
      </div>
    </div>
  );
}
