import { mediaUrl } from '../../services/http';
import { money } from '../../utils/format';

export default function MovieCard({ movie: m, mine, onTrailer, onWatchlist, onWatch, onRent, onDelete, onReport }) {
  const ratingText = m.ratings ? `★ ${m.rating}` : 'Not rated yet';
  return (
    <article className="movie-card">
      <div className="movie-poster">
        {m.posterUrl && <img src={mediaUrl(m.posterUrl)} alt="" />}
        <span>{m.title}</span>
      </div>
      <div className="movie-meta">
        <b>{m.title}</b>
        <small>
          {m.genre} · {ratingText}
          {m.label ? ` · ${m.label}` : ''}
        </small>
        <div className="movie-actions">
          {m.trailerUrl && (
            <button className="btn btn-primary" onClick={onTrailer}>
              ▶ Trailer
            </button>
          )}
          <button className="btn" style={{ background: '#edf3ff', color: '#155eef' }} onClick={onWatchlist}>
            {m.inWatchlist ? '♥ Saved' : '♡ Watchlist'}
          </button>
          {m.hasAccess ? (
            <button className="btn" style={{ background: '#f3f5f9', color: '#53627a' }} onClick={onWatch}>
              {m.access === 'free' ? 'Watch free' : 'Watch'}
            </button>
          ) : (
            <button className="btn" style={{ background: '#f3f5f9', color: '#53627a' }} onClick={onRent}>
              Rent {money(m.priceCents)}
            </button>
          )}
          <button
            className="btn"
            style={{ background: '#f3f5f9', color: '#53627a' }}
            onClick={mine ? onDelete : onReport}
          >
            {mine ? 'Delete' : 'Report'}
          </button>
        </div>
      </div>
    </article>
  );
}
