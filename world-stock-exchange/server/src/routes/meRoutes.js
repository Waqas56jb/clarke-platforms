const { Router } = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const me = require('../controllers/meController');

const router = Router();

router.use(requireAuth);
router.get('/', asyncHandler(me.getMe));
router.patch('/', asyncHandler(me.updateMe));
router.delete('/', asyncHandler(me.deleteMe));

module.exports = router;
