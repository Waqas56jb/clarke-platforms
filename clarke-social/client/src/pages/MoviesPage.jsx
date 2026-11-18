// Clarke Movies: member-uploaded films with watchlist, ratings, free viewing and WiPay rentals.
import { useState } from 'react';
import { Clapperboard, Search, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import MovieCard from '../components/movies/MovieCard';
import MoviePlayer from '../components/movies/MoviePlayer';
import MovieUploadModal from '../components/movies/MovieUploadModal';
import { GENRES } from '../components/movies/genres';
import CheckoutDialog from '../components/payments/CheckoutDialog';
import { EmptyState, ErrorState, Loading } from '../components/StateView';
import { useConfirm, useReport } from '../components/ui/ConfirmDialog';
import { useAsync } from '../hooks/useAsync';
import { useCheckout } from '../hooks/useCheckout';
import { deleteMovie, listMovies, playLink, reportMovie, toggleWatchlist } from '../services/moviesService';

const FILTERS = [
  ['all', 'All films'],
  ['free', 'Free to watch'],
  ['rent', 'Rent & buy'],
  ['original', 'Clarke Originals'],
  ['saved', 'My watchlist'],
];

function MovieControls({ query, setQuery, genre, setGenre, sort, setSort, filter, setFilter }) {
  return (
    <div className="movie-controls">
      <div className="movie-tools">
        <div className="field movie-search">
          <label className="field-label" htmlFor="movieSearch">
            Search films
          </label>
          <div className="search-field">
            <Search size={18} aria-hidden="true" />
            <input
              id="movieSearch"
              type="search"
              placeholder="Title, genre or description"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="field">
          <label className="field-label" htmlFor="movieGenre">
            Genre
          </label>
          <select id="movieGenre" value={genre} onChange={(e) => setGenre(e.target.value)}>
            <option value="all">All genres</option>
            {GENRES.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="field-label" htmlFor="movieSort">
            Sort by
          </label>
          <select id="movieSort" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="featured">Newest</option>
            <option value="az">A–Z</option>
            <option value="rating">Top rated</option>
          </select>
        </div>
      </div>
      <div className="chip-row" role="group" aria-label="Filter films">
        {FILTERS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            className="chip movie-chip"
            aria-pressed={filter === key}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function MoviesPage() {
  const { user } = useAuth();
  const { openAuth } = useNavigation();
  const toast = useToast();
  const { confirm } = useConfirm();
  const report = useReport();
  const checkout = useCheckout();
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('all');
  const [sort, setSort] = useState('featured');
  const [filter, setFilter] = useState('all');
  const [player, setPlayer] = useState(null);
  const [uploading, setUploading] = useState(false);
  const movies = useAsync(() => listMovies().then((d) => d.movies), [user?.id]);

  const patch = (updated) =>
    movies.setData((list) => list.map((m) => (m.id === updated.id ? { ...m, ...updated } : m)));

  const signedIn = (fn) => async (m) => {
    if (!user) return openAuth();
    try {
      await fn(m);
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  const actions = {
    watchlist: signedIn(async (m) => patch({ id: m.id, ...(await toggleWatchlist(m.id)) })),
    watch: signedIn(async (m) => setPlayer({ movie: m, src: (await playLink(m.id)).url, kind: 'film' })),
    rent: (m) =>
      checkout.choose({
        payload: { plan: 'movie_rental', movieId: m.id },
        name: `Rent: ${m.title}`,
        amount: m.priceCents,
        currency: 'USD',
        term: '48 hours of viewing',
      }),
    remove: signedIn(async (m) => {
      const ok = await confirm({
        title: 'Delete this film?',
        message: `“${m.title}” will be removed from Clarke Movies for everyone.`,
        confirmLabel: 'Delete film',
        danger: true,
      });
      if (!ok) return;
      await deleteMovie(m.id);
      movies.reload();
      toast('Film deleted.', 'success');
    }),
    report: signedIn(async (m) => {
      const reason = await report('film');
      if (!reason) return;
      await reportMovie(m.id, reason);
      toast('Thank you. Your report has been submitted for review.', 'success');
    }),
  };

  const q = query.trim().toLowerCase();
  const list = (movies.data || []).filter(
    (m) =>
      `${m.title} ${m.genre} ${m.label || ''} ${m.description || ''}`.toLowerCase().includes(q) &&
      (genre === 'all' || m.genre === genre) &&
      (filter === 'all' || (filter === 'saved' ? m.inWatchlist : m.access === filter))
  );
  if (sort === 'az') list.sort((a, b) => a.title.localeCompare(b.title));
  if (sort === 'rating') list.sort((a, b) => (b.rating || 0) - (a.rating || 0));

  const clearFilters = () => {
    setQuery('');
    setGenre('all');
    setFilter('all');
  };

  let grid;
  if (movies.loading && !movies.data) grid = <Loading variant="media" count={8} grid="150px" text="Loading films" />;
  else if (movies.error && !movies.data)
    grid = <ErrorState title="Couldn't load films" message={movies.error} onRetry={movies.reload} />;
  else if (!movies.data.length)
    grid = (
      <EmptyState icon={Clapperboard} title="No movies available right now.">
        Creators can publish the first film with Creator studio.
      </EmptyState>
    );
  else if (!list.length)
    grid = (
      <EmptyState
        icon={Search}
        title="No films match your search."
        action={
          <button type="button" className="btn btn-secondary" onClick={clearFilters}>
            Clear filters
          </button>
        }
      >
        Try another title or genre.
      </EmptyState>
    );
  else
    grid = (
      <div className="movie-grid" id="movieGrid">
        {list.map((m) => (
          <MovieCard
            key={m.id}
            movie={m}
            mine={m.ownerId === user?.id}
            onTrailer={() => setPlayer({ movie: m, src: m.trailerUrl, kind: 'trailer' })}
            onWatchlist={() => actions.watchlist(m)}
            onWatch={() => actions.watch(m)}
            onRent={() => actions.rent(m)}
            onDelete={() => actions.remove(m)}
            onReport={() => actions.report(m)}
          />
        ))}
      </div>
    );

  return (
    <div className="movies-page">
      <header className="page-header">
        <div>
          <h1>Clarke Movies</h1>
          <p>Films published by Clarke creators. Watch free films, rent new releases and keep a watchlist.</p>
        </div>
        <button
          type="button"
          className="btn btn-secondary movie-chip"
          onClick={() => (user ? setUploading(true) : openAuth())}
        >
          <Upload size={20} aria-hidden="true" />
          Creator studio
        </button>
      </header>
      <MovieControls {...{ query, setQuery, genre, setGenre, sort, setSort, filter, setFilter }} />
      <p className="sr-only" aria-live="polite">
        {movies.data ? `${list.length} ${list.length === 1 ? 'film' : 'films'} shown` : ''}
      </p>
      <section aria-label="Films">{grid}</section>
      <p className="fine-print">
        Rentals are paid securely through WiPay and give 48 hours of viewing. Full films stream only to members with
        access.
      </p>
      {player && (
        <MoviePlayer
          movie={player.movie}
          src={player.src}
          kind={player.kind}
          onClose={() => setPlayer(null)}
          onRated={patch}
        />
      )}
      {uploading && (
        <MovieUploadModal
          onClose={() => setUploading(false)}
          onUploaded={() => {
            setUploading(false);
            toast('Your film is published.', 'success');
            movies.reload();
          }}
        />
      )}
      {checkout.item && <CheckoutDialog item={checkout.item} onClose={checkout.close} />}
    </div>
  );
}
