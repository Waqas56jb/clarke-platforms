// Clarke Movies demo catalogue from the Movies preview. Browser-only; no streaming backend exists.
import { useState } from 'react';
import MovieCard from '../components/movies/MovieCard';

const MOVIES = [
  ['The Last Horizon', 'Sci-Fi', 'Original', 'Clarke Original', '8.8'],
  ['Island of Secrets', 'Drama', 'Rent', 'New release', '8.5'],
  ['Laugh Out Loud', 'Comedy', 'Free', 'Community pick', '8.1'],
  ['Deep Blue Mission', 'Action', 'Rent', '4K UHD', '8.7'],
  ['Wild Earth', 'Documentary', 'Free', 'Documentary', '9.1'],
  ['The Family Quest', 'Family', 'Rent', 'Family night', '8.3'],
  ['City After Dark', 'Drama', 'Original', 'Clarke Original', '8.4'],
  ['Beyond Tomorrow', 'Sci-Fi', 'Rent', 'Coming soon', '8.9'],
];

const GENRES = ['Action', 'Comedy', 'Drama', 'Documentary', 'Family', 'Sci-Fi'];

const FILTERS = [
  ['all', 'All films'],
  ['free', 'Free to watch'],
  ['rent', 'Rent & buy'],
  ['original', 'Clarke Originals'],
  ['saved', 'My watchlist'],
];

const EXTRAS = [
  ['party', '👥 Watch Party'],
  ['downloads', '⬇ Offline downloads'],
  ['kids', '🧒 Kids profiles & PIN'],
  ['subtitles', 'CC Subtitles & audio'],
  ['premiere', '⭐ Premieres & live events'],
  ['creator', '🎥 Creator studio'],
];

const ACCESS_BY_FILTER = { free: 'Free', rent: 'Rent', original: 'Original' };

export default function MoviesPage() {
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('all');
  const [sort, setSort] = useState('featured');
  const [filter, setFilter] = useState('all');
  const [saved, setSaved] = useState(() => new Set());

  const toggleSave = (title) =>
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });

  const q = query.toLowerCase();
  const list = MOVIES.filter(
    (m) =>
      `${m[0]} ${m[1]} ${m[3]}`.toLowerCase().includes(q) &&
      (genre === 'all' || m[1] === genre) &&
      (filter === 'all' || (filter === 'saved' ? saved.has(m[0]) : m[2] === ACCESS_BY_FILTER[filter]))
  );
  if (sort === 'az') list.sort((a, b) => a[0].localeCompare(b[0]));
  if (sort === 'rating') list.sort((a, b) => Number(b[4]) - Number(a[4]));

  return (
    <>
      <section className="movie-hero">
        <div>
          <span className="eyebrow">CLARKE ENTERTAINMENT</span>
          <h2>Your next movie night starts here.</h2>
          <p>
            Discover films, watch trailers, rent new releases, build a watchlist and enjoy cinema nights with friends.
          </p>
          <button className="btn btn-white" id="movieBrowse">
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
          <option value="featured">Featured</option>
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
          <p>Films and series selected for Clarke members</p>
        </div>
        <span className="eyebrow" style={{ color: '#155eef' }}>
          DEMO CATALOG
        </span>
      </div>
      <div className="movie-grid" id="movieGrid">
        {list.length ? (
          list.map((m) => <MovieCard key={m[0]} movie={m} saved={saved.has(m[0])} onToggleSave={toggleSave} />)
        ) : (
          <p>No films match your search.</p>
        )}
      </div>
      <section className="card-panel" style={{ padding: 18, marginTop: 18 }}>
        <div className="section-heading">
          <div>
            <h3>More ways to watch</h3>
            <p>Build a complete movie-night experience</p>
          </div>
        </div>
        <div className="movie-row">
          {EXTRAS.map(([key, label]) => (
            <button
              key={key}
              className="movie-chip"
              onClick={() =>
                alert(`${key} feature added to the Clarke Movies roadmap. Production setup is still required.`)
              }
            >
              {label}
            </button>
          ))}
        </div>
        <p className="movie-note">
          This is a browser preview. Playback, rentals, subscriptions, offline downloads, watch parties and account
          syncing require the production streaming backend, licensed video files, payment setup and secure video
          delivery.
        </p>
      </section>
    </>
  );
}
