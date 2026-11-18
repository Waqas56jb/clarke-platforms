// Music and movies.
const musicService = require('../services/musicService');
const movieService = require('../services/movieService');
const { signScoped } = require('../utils/tokens');

const id = (req) => Number(req.params.id);
const viewer = (req) => req.user?.id || 0;

const tracks = async (req, res) => res.json({ tracks: await musicService.catalogue(viewer(req)) });
const likeTrack = async (req, res) => res.json(await musicService.toggleLike(req.user.id, id(req)));
const playlists = async (req, res) => res.json({ playlists: await musicService.playlists(req.user.id) });

async function removeTrack(req, res) {
  await musicService.remove(req.user.id, id(req));
  res.json({ ok: true });
}

async function reportTrack(req, res) {
  await musicService.report(req.user.id, id(req), req.body?.reason);
  res.status(201).json({ ok: true });
}

async function createPlaylist(req, res) {
  res.status(201).json({ playlist: await musicService.createPlaylist(req.user.id, req.body?.name) });
}

async function addToPlaylist(req, res) {
  await musicService.addToPlaylist(req.user.id, id(req), Number(req.body?.trackId));
  res.json({ ok: true });
}

const movies = async (req, res) => res.json({ movies: await movieService.catalogue(viewer(req)) });
const watchlist = async (req, res) => res.json(await movieService.toggleWatchlist(req.user.id, id(req)));
const rateMovie = async (req, res) =>
  res.json({ movie: await movieService.rate(req.user.id, id(req), req.body?.score) });

async function removeMovie(req, res) {
  await movieService.remove(req.user.id, id(req));
  res.json({ ok: true });
}

async function reportMovie(req, res) {
  await movieService.report(req.user.id, id(req), req.body?.reason);
  res.status(201).json({ ok: true });
}

// Signed link served by /api/files/movie/:token, which re-checks access on every range request.
async function playMovie(req, res) {
  await movieService.assertCanWatch(req.user.id, id(req));
  res.json({ url: `/api/files/movie/${signScoped(req.user.id, 'file', 4 * 3600, { kind: 'movie', id: id(req) })}` });
}

module.exports = {
  tracks,
  likeTrack,
  playlists,
  removeTrack,
  reportTrack,
  createPlaylist,
  addToPlaylist,
  movies,
  watchlist,
  rateMovie,
  removeMovie,
  reportMovie,
  playMovie,
};
