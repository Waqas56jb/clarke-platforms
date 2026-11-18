// Clarke Movies: member uploads with a rights declaration, watchlist, ratings and rentals. Full films are
// stored privately and streamed only through signed links after an access check.
const { one, many, query } = require('../db/pool');
const HttpError = require('../utils/httpError');
const { removeStored } = require('../utils/storage');
const { iso } = require('../utils/serializers');

const GENRES = ['Action', 'Comedy', 'Drama', 'Documentary', 'Family', 'Sci-Fi'];
const ACCESS = ['free', 'rent', 'original'];

const SELECT = `SELECT m.*, u.display_name owner_name,
  ROUND(AVG(r.score)::numeric, 1)::float rating, COUNT(r.score)::int ratings,
  EXISTS(SELECT 1 FROM movie_watchlist w WHERE w.movie_id=m.id AND w.user_id=$1) in_watchlist,
  (SELECT score FROM movie_ratings mr WHERE mr.movie_id=m.id AND mr.user_id=$1) my_rating,
  (m.access='free' OR m.owner_id=$1 OR EXISTS(SELECT 1 FROM movie_rentals x WHERE x.movie_id=m.id AND x.user_id=$1 AND x.expires_at > now())) has_access
  FROM movies m JOIN users u ON u.id=m.owner_id LEFT JOIN movie_ratings r ON r.movie_id=m.id`;

const toMovie = (r) => ({
  id: r.id,
  title: r.title,
  genre: r.genre,
  access: r.access,
  label: r.label,
  description: r.description,
  priceCents: r.price_cents,
  posterUrl: r.poster_path,
  trailerUrl: r.trailer_path,
  ownerId: r.owner_id,
  ownerName: r.owner_name,
  rating: r.rating,
  ratings: r.ratings,
  myRating: r.my_rating,
  inWatchlist: r.in_watchlist,
  hasAccess: r.has_access,
  createdAt: iso(r.created_at),
});

const getMovie = async (viewerId, movieId) => {
  const row = await one(`${SELECT} WHERE m.id=$2 GROUP BY m.id, u.display_name`, [viewerId || 0, movieId]);
  if (!row) throw new HttpError(404, 'Film not found.');
  return toMovie(row);
};

async function catalogue(viewerId) {
  const rows = await many(`${SELECT} GROUP BY m.id, u.display_name ORDER BY m.id DESC LIMIT 200`, [viewerId || 0]);
  return rows.map(toMovie);
}

async function create(userId, body, uploads) {
  const title = String(body.title || '')
    .trim()
    .slice(0, 120);
  if (!title) throw new HttpError(400, 'Enter the film title.');
  if (!GENRES.includes(body.genre)) throw new HttpError(400, 'Choose a genre.');
  if (!ACCESS.includes(body.access)) throw new HttpError(400, 'Choose how members can watch the film.');
  if (String(body.declaration) !== 'true') throw new HttpError(400, 'Confirm the rights declaration to upload.');
  if (!uploads.video) throw new HttpError(400, 'Choose the film video file.');
  const priceCents = body.access === 'free' ? 0 : Math.round(Number(body.price) * 100);
  if (body.access !== 'free' && !(priceCents >= 50 && priceCents <= 100000))
    throw new HttpError(400, 'Set a rental price between 0.50 and 1,000.00.');
  const row = await one(
    `INSERT INTO movies(owner_id,title,genre,access,label,description,price_cents,poster_path,trailer_path,trailer_type,video_path,video_type)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
    [
      userId,
      title,
      body.genre,
      body.access,
      String(body.label || '')
        .trim()
        .slice(0, 40),
      String(body.description || '')
        .trim()
        .slice(0, 600),
      priceCents,
      uploads.poster?.stored || '',
      uploads.trailer?.stored || '',
      uploads.trailer?.type || '',
      uploads.video.stored,
      uploads.video.type,
    ]
  );
  return getMovie(userId, row.id);
}

async function remove(userId, movieId) {
  const row = await one(
    'DELETE FROM movies WHERE id=$1 AND owner_id=$2 RETURNING poster_path, trailer_path, video_path',
    [movieId, userId]
  );
  if (!row) throw new HttpError(404, 'Film not found.');
  await removeStored(row.poster_path, row.trailer_path, row.video_path);
}

async function toggleWatchlist(userId, movieId) {
  await getMovie(userId, movieId);
  const removed = await query('DELETE FROM movie_watchlist WHERE user_id=$1 AND movie_id=$2', [userId, movieId]);
  if (!removed.rowCount) await query('INSERT INTO movie_watchlist(user_id,movie_id) VALUES($1,$2)', [userId, movieId]);
  return { inWatchlist: !removed.rowCount };
}

async function rate(userId, movieId, score) {
  const value = Number(score);
  if (!Number.isInteger(value) || value < 1 || value > 10) throw new HttpError(400, 'Rate the film from 1 to 10.');
  await getMovie(userId, movieId);
  await query(
    `INSERT INTO movie_ratings(user_id,movie_id,score) VALUES($1,$2,$3)
     ON CONFLICT(user_id,movie_id) DO UPDATE SET score=excluded.score`,
    [userId, movieId, value]
  );
  return getMovie(userId, movieId);
}

// Checked when a play link is issued and again on every streamed request.
async function assertCanWatch(userId, movieId) {
  const movie = await getMovie(userId, movieId);
  if (!movie.hasAccess) throw new HttpError(402, 'Rent this film to watch it.');
  return one('SELECT video_path, video_type FROM movies WHERE id=$1', [movieId]);
}

async function report(userId, movieId, reason) {
  await getMovie(userId, movieId);
  const text = String(reason || '')
    .trim()
    .slice(0, 300);
  if (!text) throw new HttpError(400, 'Tell us why you are reporting this film.');
  await query(`INSERT INTO reports(reporter_id,target_type,target_id,reason) VALUES($1,'movie',$2,$3)`, [
    userId,
    movieId,
    text,
  ]);
}

module.exports = { catalogue, create, remove, toggleWatchlist, rate, assertCanWatch, report };
