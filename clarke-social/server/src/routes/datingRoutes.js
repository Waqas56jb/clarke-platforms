const { Router } = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const dating = require('../controllers/datingController');

const router = Router();
const a = asyncHandler;

router.use(requireAuth);
router.get('/me', a(dating.getMe));
router.put('/me', a(dating.saveMe));
router.get('/discover', a(dating.discover));
router.post('/like/:id', a(dating.like));
router.post('/pass/:id', a(dating.pass));
router.get('/matches', a(dating.matches));
router.post('/block/:id', a(dating.block));
router.post('/report/:id', a(dating.report));

module.exports = router;
