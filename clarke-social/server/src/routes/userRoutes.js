const { Router } = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const users = require('../controllers/userController');

const router = Router();

router.get('/search', optionalAuth, asyncHandler(users.searchUsers));
router.get('/suggestions', optionalAuth, asyncHandler(users.suggestions));
router.get('/:id/followers', optionalAuth, asyncHandler(users.connections));
router.get('/:id/following', optionalAuth, asyncHandler(users.connections));
router.get('/:id', optionalAuth, asyncHandler(users.profile));
router.post('/:id/follow', requireAuth, asyncHandler(users.follow));
router.post('/:id/block', requireAuth, asyncHandler(users.blockUser));

module.exports = router;
