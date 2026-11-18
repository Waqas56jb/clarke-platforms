const { Router } = require('express');
const requireAuth = require('../middleware/auth');
const dating = require('../controllers/datingController');

const router = Router();

router.use(requireAuth);
router.get('/me', dating.getMe);
router.put('/me', dating.saveMe);
router.get('/discover', dating.discover);
router.post('/like/:id', dating.like);
router.get('/matches', dating.matches);
router.post('/block/:id', dating.block);
router.post('/report/:id', dating.report);

module.exports = router;
