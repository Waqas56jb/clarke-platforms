const { Router } = require('express');
const asyncHandler = require('../utils/asyncHandler');
const requireAuth = require('../middleware/requireAuth');
const { validateRequiredString } = require('../utils/requestValidation');
const validate = require('../middleware/validate');
const { methodNotAllowed } = require('../middleware/errorHandler');
const { transferLimiter } = require('../middleware/rateLimits');
const wallet = require('../controllers/walletController');

const router = Router();

// Transfers must carry an Idempotency-Key header of 16–100 characters.
const idempotencyKeyCheck = (req) =>
  validateRequiredString(req.get('idempotency-key'), ['header', 'Idempotency-Key'], { minLength: 16, maxLength: 100 });

const transferSchema = {
  recipient_email: { type: 'email', required: true },
  amount: { type: 'decimal', required: true, maxDigits: 24, decimalPlaces: 8 },
};

router.get('/', requireAuth, asyncHandler(wallet.balance));
router.get('/transactions', requireAuth, asyncHandler(wallet.transactions));
router.post(
  '/transfers',
  requireAuth,
  validate(transferSchema, [idempotencyKeyCheck]),
  transferLimiter,
  asyncHandler(wallet.transfer)
);
['/', '/transactions', '/transfers'].forEach((path) => router.all(path, methodNotAllowed));

// Deliberately no endpoint to activate wallets, mint coins, credit accounts, or initiate bank/card payments.
module.exports = router;
