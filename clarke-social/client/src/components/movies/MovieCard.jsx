export default function MovieCard({ movie, saved, onToggleSave }) {
  const [title, genre, access, label, rating] = movie;
  return (
    <article className="movie-card">
      <div className="movie-poster">{title}</div>
      <div className="movie-meta">
        <b>{title}</b>
        <small>
          {genre} · ★ {rating} · {label}
        </small>
        <div className="movie-actions">
          <button
            className="btn btn-primary"
            onClick={() =>
              alert(`Trailer preview selected: ${title}. Connect a licensed trailer video to enable playback.`)
            }
          >
            ▶ Trailer
          </button>
          <button
            className="btn"
            style={{ background: '#edf3ff', color: '#155eef' }}
            onClick={() => onToggleSave(title)}
          >
            {saved ? '♥ Saved' : '♡ Watchlist'}
          </button>
          <button
            className="btn"
            style={{ background: '#f3f5f9', color: '#53627a' }}
            onClick={() =>
              alert(
                `Selected: ${title}. Secure checkout and streaming access will be enabled after payment integration.`
              )
            }
          >
            {access === 'Free' ? 'Watch free' : 'Rent'}
          </button>
        </div>
      </div>
    </article>
  );
}
