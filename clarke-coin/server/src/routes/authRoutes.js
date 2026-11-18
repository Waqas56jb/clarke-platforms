const { Router } = require('express');
const asyncHandler = require('../utils/asyncHandler');
const requireAuth = require('../middleware/requireAuth');
const validate = require('../middleware/validate');
const { methodNotAllowed } = require('../middleware/errorHandler');
const { registerLimiter, loginLimiter } = require('../middleware/rateLimits');
const auth = require('../controllers/authController');

const router = Router();

const registerSchema = {
  email: { type: 'email', required: true },
  password: { type: 'string', required: true, minLength: 12, maxLength: 128 },
};
const loginSchema = {
  email: { type: 'email', required: true },
  password: { type: 'string', required: true, minLength: 1, maxLength: 128 },
  mfa_code: { type: 'string', nullable: true, minLength: 6, maxLength: 8 },
};

// Order matches FastAPI: authentication, then request validation, then the route's rate limit.
router.post('/register', validate(registerSchema), registerLimiter, asyncHandler(auth.register));
router.post('/login', validate(loginSchema), loginLimiter, asyncHandler(auth.login));
router.get('/me', requireAuth, auth.me);
router.post('/mfa/setup', requireAuth, asyncHandler(auth.mfaSetup));
router.post('/mfa/enable', requireAuth, asyncHandler(auth.mfaEnable));
['/register', '/login', '/me', '/mfa/setup', '/mfa/enable'].forEach((path) => router.all(path, methodNotAllowed));

module.exports = router;
