const { Router } = require('express');
const requireAuth = require('../middleware/auth');
const calls = require('../controllers/callController');

const router = Router();

router.get('/ice-config', calls.iceConfig);
router.get('/history', requireAuth, calls.history);

module.exports = router;
