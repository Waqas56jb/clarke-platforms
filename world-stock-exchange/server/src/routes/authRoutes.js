const { Router } = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { authLimiter, emailLimiter } = require('../middleware/rateLimits');
const auth = require('../controllers/authController');

const router = Router();

router.get('/csrf', auth.csrf);
router.post('/register', authLimiter, asyncHandler(auth.register));
router.post('/login', authLimiter, asyncHandler(auth.login));
router.post('/logout', auth.logout);
router.post('/verify-email', authLimiter, asyncHandler(auth.verifyEmail));
router.post('/resend-verification', emailLimiter, asyncHandler(auth.resendVerification));
router.post('/forgot-password', emailLimiter, asyncHandler(auth.forgotPassword));
router.post('/reset-password', authLimiter, asyncHandler(auth.resetPassword));

module.exports = router;
