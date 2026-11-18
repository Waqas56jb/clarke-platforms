// Signed, short-lived file links served straight from the API host. Permission is checked again on
// every request, so a link stops working as soon as access is withdrawn.
const path = require('path');
const { Router } = require('express');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');
const { verifyToken } = require('../utils/tokens');
const { diskPath } = require('../utils/storage');
const postService = require('../services/postService');
const movieService = require('../services/movieService');

const router = Router();

function readToken(req, kind) {
  try {
    const payload = verifyToken(req.params.token, 'file');
    if (payload.kind === kind) return payload;
  } catch {
    // Fall through to the error below.
  }
  throw new HttpError(403, 'This link has expired. Go back and try again.');
}

router.get(
  '/download/:token',
  asyncHandler(async (req, res) => {
    const { sub, id } = readToken(req, 'post');
    const post = await postService.assertCanDownload(sub, id);
    const file = diskPath(post.media_path);
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.download(file, `clarke-${id}${path.extname(file)}`);
  })
);

router.get(
  '/movie/:token',
  asyncHandler(async (req, res) => {
    const { sub, id } = readToken(req, 'movie');
    const movie = await movieService.assertCanWatch(sub, id);
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.type(movie.video_type);
    res.sendFile(diskPath(movie.video_path));
  })
);

module.exports = router;
