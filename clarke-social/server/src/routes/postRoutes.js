const { Router } = require('express');
const requireAuth = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const posts = require('../controllers/postController');

const router = Router();

router.get('/', posts.list);
router.post('/', requireAuth, upload.single('media'), posts.create);
router.post('/:id/like', requireAuth, posts.like);
router.get('/:id/comments', posts.listComments);
router.post('/:id/comments', requireAuth, posts.addComment);
router.post('/:id/report', requireAuth, posts.report);
router.get('/:id/download', requireAuth, posts.download);

module.exports = router;
