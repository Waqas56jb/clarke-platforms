const { Router } = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const media = require('../controllers/mediaController');

const router = Router();
const a = asyncHandler;

router.get('/music/tracks', optionalAuth, a(media.tracks));
router.delete('/music/tracks/:id', requireAuth, a(media.removeTrack));
router.post('/music/tracks/:id/like', requireAuth, a(media.likeTrack));
router.post('/music/tracks/:id/report', requireAuth, a(media.reportTrack));
router.get('/music/playlists', requireAuth, a(media.playlists));
router.post('/music/playlists', requireAuth, a(media.createPlaylist));
router.post('/music/playlists/:id/tracks', requireAuth, a(media.addToPlaylist));

router.get('/movies', optionalAuth, a(media.movies));
router.delete('/movies/:id', requireAuth, a(media.removeMovie));
router.post('/movies/:id/watchlist', requireAuth, a(media.watchlist));
router.post('/movies/:id/rate', requireAuth, a(media.rateMovie));
router.post('/movies/:id/report', requireAuth, a(media.reportMovie));
router.get('/movies/:id/play', requireAuth, a(media.playMovie));

module.exports = router;
