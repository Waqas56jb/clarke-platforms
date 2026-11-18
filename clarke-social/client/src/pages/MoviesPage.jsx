// Clarke Movies: member-uploaded films with watchlist, ratings, free viewing and WiPay rentals.
import { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import MovieCard from '../components/movies/MovieCard';
import MoviePlayer from '../components/movies/MoviePlayer';
import MovieUploadModal from '../components/movies/MovieUploadModal';
import { ErrorState, Loading } from '../components/StateView';
import { useAsync } from '../hooks/useAsync';
import { useCheckout } from '../hooks/useCheckout';
import { deleteMovie, listMovies, playLink, reportMovie, toggleWatchlist } from '../services/moviesService';

const GENRES = ['Action', 'Comedy', 'Drama', 'Documentary', 'Family', 'Sci-Fi'];
const FILTERS = [
  ['all', 'All films'],
  ['free', 'Free to watch'],
  ['rent', 'Rent & buy'],
  ['original', 'Clarke Originals'],
  ['saved', 'My watchlist'],
];

export default function MoviesPage() {
  const { user } = useAuth();
  const { openAuth } = useNavigation();
  const toast = useToast();
  const checkout = useCheckout();
  const gridRef = useRef(null);
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
      toast(e.message);
    }
  };

  const actions = {
    watchlist: signedIn(async (m) => patch({ id: m.id, ...(await toggleWatchlist(m.id)) })),
    watch: signedIn(async (m) => setPlayer({ movie: m, src: (await playLink(m.id)).url, kind: 'film' })),
    rent: signedIn((m) => checkout({ plan: 'movie_rental', movieId: m.id })),
    remove: signedIn(async (m) => {
      if (!window.confirm(`Delete “${m.title}”?`)) return;
      await deleteMovie(m.id);
      movies.reload();
    }),
    report: signedIn(async (m) => {
      const reason = window.prompt('Why are you reporting this film?');
      if (!reason) return;
      await reportMovie(m.id, reason);
      toast('Thank you. Your report has been submitted for review.');
    }),
  };

  const q = query.toLowerCase();
  const list = (movies.data || []).filter(
    (m) =>
      `${m.title} ${m.genre} ${m.label} ${m.description}`.toLowerCase().includes(q) &&
      (genre === 'all' || m.genre === genre) &&
      (filter === 'all' || (filter === 'saved' ? m.inWatchlist : m.access === filter))
  );
  if (sort === 'az') list.sort((a, b) => a.title.localeCompare(b.title));
  if (sort === 'rating') list.sort((a, b) => (b.rating || 0) - (a.rating || 0));

  let grid;
  if (movies.loading && !movies.data) grid = <Loading text="Loading films…" />;
  else if (movies.error) grid = <ErrorState message={movies.error} onRetry={movies.reload} />;
  else if (!movies.data.length)
    grid = <p>No films have been published yet. Creators can add the first one with Creator studio below.</p>;
  else if (!list.length) grid = <p>No films match your search.</p>;
  else
    grid = list.map((m) => (
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
    ));

  return (
    <>
      <section className="movie-hero">
        <div>
          <span className="eyebrow">CLARKE ENTERTAINMENT</span>
          <h2>Your next movie night starts here.</h2>
          <p>
            Discover films, watch trailers, rent new releases, build a watchlist and enjoy cinema nights with friends.
          </p>
          <button
            className="btn btn-white"
            id="movieBrowse"
            onClick={() => gridRef.current?.scrollIntoView({ behavior: 'smooth' })}
          >
            Browse films ↓
          </button>
        </div>
        <div style={{ fontSize: 74, opacity: 0.9 }}>🎬</div>
      </section>
      <div className="movie-tools">
        <input
          id="movieSearch"
          placeholder="Search movies, actors or directors"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select id="movieGenre" value={genre} onChange={(e) => setGenre(e.target.value)}>
          <option value="all">All genres</option>
          {GENRES.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
        <select id="movieSort" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="featured">Newest</option>
          <option value="az">A–Z</option>
          <option value="rating">Top rated</option>
        </select>
      </div>
      <div className="movie-row">
        {FILTERS.map(([key, label]) => (
          <button key={key} className={`movie-chip${filter === key ? ' active' : ''}`} onClick={() => setFilter(key)}>
            {label}
          </button>
        ))}
      </div>
      <div className="section-heading">
        <div>
          <h2>Featured for you</h2>
          <p>Films and series published by Clarke creators</p>
        </div>
      </div>
      <div className="movie-grid" id="movieGrid" ref={gridRef}>
        {grid}
      </div>
      <section className="card-panel" style={{ padding: 18, marginTop: 18 }}>
        <div className="section-heading">
          <div>
            <h3>More ways to watch</h3>
            <p>Publish your own films to the Clarke community</p>
          </div>
        </div>
        <div className="movie-row">
          <button className="movie-chip" onClick={() => (user ? setUploading(true) : openAuth())}>
            🎥 Creator studio
          </button>
        </div>
        <p className="movie-note">
          Rentals are paid securely through WiPay and give 48 hours of viewing. Full films stream only to members with
          access.
        </p>
      </section>
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
            toast('Your film is published.');
            movies.reload();
          }}
        />
      )}
    </>
  );
}
