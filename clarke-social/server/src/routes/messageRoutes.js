const { Router } = require('express');
const requireAuth = require('../middleware/auth');
const messages = require('../controllers/messageController');

const router = Router();

router.post('/', requireAuth, messages.send);
router.get('/:userId', requireAuth, messages.conversation);

module.exports = router;
