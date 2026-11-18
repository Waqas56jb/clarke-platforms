const { Router } = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const { checkoutLimiter } = require('../middleware/rateLimits');
const payments = require('../controllers/paymentController');

const router = Router();

router.get('/config', payments.config);
router.post('/checkout', requireAuth, checkoutLimiter, asyncHandler(payments.checkout));
router.get('/history', requireAuth, asyncHandler(payments.history));
router.get('/memberships', requireAuth, asyncHandler(payments.memberships));
router.get('/wipay/return', asyncHandler(payments.wipayReturn));

module.exports = router;
