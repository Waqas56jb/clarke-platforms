const { Router } = require('express');
const asyncHandler = require('../utils/asyncHandler');
const auth = require('../controllers/authController');

const router = Router();

router.post('/register', asyncHandler(auth.register));
router.post('/login', asyncHandler(auth.login));
router.post('/logout', auth.logout);

module.exports = router;
