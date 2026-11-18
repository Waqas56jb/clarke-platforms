const { Router } = require('express');
const requireAuth = require('../middleware/auth');
const me = require('../controllers/meController');

const router = Router();

router.get('/', requireAuth, me.getMe);
router.patch('/', requireAuth, me.updateMe);

module.exports = router;
