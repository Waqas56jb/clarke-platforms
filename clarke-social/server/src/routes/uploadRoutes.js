const { Router } = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth, requireUploadToken } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/rateLimits');
const { uploader } = require('../middleware/upload');
const uploads = require('../controllers/uploadController');

const router = Router();

router.get('/token', requireAuth, uploads.token);
router.post('/post', uploadLimiter, requireUploadToken, uploader('post'), asyncHandler(uploads.post));
router.post('/story', uploadLimiter, requireUploadToken, uploader('story'), asyncHandler(uploads.story));
router.post('/avatar', uploadLimiter, requireUploadToken, uploader('avatar'), asyncHandler(uploads.avatar));
router.post('/track', uploadLimiter, requireUploadToken, uploader('track'), asyncHandler(uploads.track));
router.post('/movie', uploadLimiter, requireUploadToken, uploader('movie'), asyncHandler(uploads.movie));

module.exports = router;
