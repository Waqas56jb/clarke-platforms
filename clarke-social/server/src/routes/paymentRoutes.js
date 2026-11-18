const { Router } = require('express');
const requireAuth = require('../middleware/auth');
const { checkoutLimiter } = require('../middleware/rateLimits');
const asyncHandler = require('../utils/asyncHandler');
const payments = require('../controllers/paymentController');

const router = Router();

router.get('/config', payments.config);
router.post('/checkout', requireAuth, checkoutLimiter, asyncHandler(payments.checkout));
router.get('/history', requireAuth, payments.history);

module.exports = router;
