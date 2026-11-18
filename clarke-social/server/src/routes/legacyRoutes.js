// Endpoints that existed only in the Clarke Social starter, kept so existing clients keep working.
const { Router } = require('express');
const requireAuth = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimits');
const asyncHandler = require('../utils/asyncHandler');
const auth = require('../controllers/authController');
const users = require('../controllers/userController');
const { health } = require('../controllers/healthController');

const router = Router();

router.post('/register', authLimiter, asyncHandler(auth.registerLegacy));
router.post('/login', authLimiter, asyncHandler(auth.loginLegacy));
router.post('/follow/:userId', requireAuth, users.followLegacy);
router.get('/health', health);

module.exports = router;
