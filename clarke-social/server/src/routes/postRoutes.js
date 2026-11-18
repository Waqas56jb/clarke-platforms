const { Router } = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const posts = require('../controllers/postController');

const router = Router();
const a = asyncHandler;

router.get('/', optionalAuth, a(posts.list));
router.post('/', requireAuth, a(posts.create));
router.get('/:id', optionalAuth, a(posts.get));
router.delete('/:id', requireAuth, a(posts.remove));
router.post('/:id/like', requireAuth, a(posts.like));
router.post('/:id/save', requireAuth, a(posts.save));
router.post('/:id/share', optionalAuth, a(posts.share));
router.post('/:id/repost', requireAuth, a(posts.repost));
router.get('/:id/comments', a(posts.listComments));
router.post('/:id/comments', requireAuth, a(posts.addComment));
router.post('/:id/report', requireAuth, a(posts.report));
router.get('/:id/download-link', requireAuth, a(posts.downloadLink));

module.exports = router;
