import { Bookmark, Clapperboard, Flag, MoreHorizontal, Play, Star, Trash2 } from 'lucide-react';
import { mediaUrl } from '../../services/http';
import { money } from '../../utils/format';
import Menu from '../ui/Menu';

const ACCESS = { free: 'Free', rent: 'Rent', original: 'Clarke Original' };

export default function MovieCard({ movie: m, mine, onTrailer, onWatchlist, onWatch, onRent, onDelete, onReport }) {
  return (
    <article className="movie-card" aria-labelledby={`movie-${m.id}`}>
      <div className="movie-poster">
        {m.posterUrl ? (
          <img src={mediaUrl(m.posterUrl)} alt="" loading="lazy" decoding="async" />
        ) : (
          <div className="movie-poster-fallback" aria-hidden="true">
            <Clapperboard size={40} />
            <span>{m.title}</span>
          </div>
        )}
        <button
          type="button"
          className={`icon-btn movie-watchlist${m.inWatchlist ? ' saved' : ''}`}
          aria-label={m.inWatchlist ? `Remove ${m.title} from watchlist` : `Add ${m.title} to watchlist`}
          onClick={onWatchlist}
        >
          <Bookmark size={20} aria-hidden="true" fill={m.inWatchlist ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="movie-meta">
        <h3 className="movie-title" id={`movie-${m.id}`}>
          {m.title}
        </h3>
        <p className="movie-sub">
          <span className="truncate">{m.genre}</span>
          <span className="movie-rating">
            <Star size={12} aria-hidden="true" fill="currentColor" />
            {m.ratings ? (
              <>
                <span className="sr-only">Rated</span> {m.rating}
              </>
            ) : (
              'Not rated yet'
            )}
          </span>
        </p>
        <div className="row-wrap movie-badges">
          <span className={`badge${m.access === 'free' ? ' badge-success' : ''}`}>{ACCESS[m.access] || m.access}</span>
          {m.label && <span className="badge badge-neutral movie-label">{m.label}</span>}
        </div>
        <div className="movie-actions">
          {m.trailerUrl ? (
            <button
              type="button"
              className="btn-link movie-trailer"
              onClick={onTrailer}
              aria-label={`Watch trailer for ${m.title}`}
            >
              <Play size={16} aria-hidden="true" />
              Trailer
            </button>
          ) : (
            <span className="grow" />
          )}
          <Menu
            label={`More actions for ${m.title}`}
            trigger={<MoreHorizontal size={20} aria-hidden="true" />}
            items={[
              {
                label: 'Delete film',
                icon: <Trash2 size={20} aria-hidden="true" />,
                onSelect: onDelete,
                danger: true,
                hidden: !mine,
              },
              { label: 'Report film', icon: <Flag size={20} aria-hidden="true" />, onSelect: onReport, hidden: mine },
            ]}
          />
        </div>
        {m.hasAccess ? (
          <button type="button" className="btn btn-primary btn-sm btn-block movie-cta" onClick={onWatch}>
            {m.access === 'free' ? 'Watch free' : 'Watch'}
          </button>
        ) : (
          <button type="button" className="btn btn-primary btn-sm btn-block movie-cta" onClick={onRent}>
            Rent {money(m.priceCents)}
          </button>
        )}
      </div>
    </article>
  );
}
