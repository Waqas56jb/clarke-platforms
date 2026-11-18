const { Router } = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const { messageLimiter } = require('../middleware/rateLimits');
const messages = require('../controllers/messageController');

const router = Router();

router.use(requireAuth);
router.get('/', asyncHandler(messages.conversations));
router.get('/contacts', asyncHandler(messages.contacts));
router.get('/unread', asyncHandler(messages.unread));
router.get('/:userId', asyncHandler(messages.thread));
router.post('/:userId', messageLimiter, asyncHandler(messages.send));
router.post('/:userId/read', asyncHandler(messages.markRead));

module.exports = router;
