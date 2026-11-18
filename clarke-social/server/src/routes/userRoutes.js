const { Router } = require('express');
const requireAuth = require('../middleware/auth');
const users = require('../controllers/userController');

const router = Router();

router.post('/:id/follow', requireAuth, users.follow);
router.get('/search', users.search);

module.exports = router;
