// Site-wide search and trending hashtags.
const { Router } = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { optionalAuth } = require('../middleware/auth');
const users = require('../controllers/userController');

const router = Router();

router.get('/search', optionalAuth, asyncHandler(users.search));
router.get('/trending', asyncHandler(users.trending));

module.exports = router;
