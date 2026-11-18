const { Router } = require('express');
const { writeLimiter } = require('../middleware/rateLimits');
const fund = require('../controllers/fundController');

const router = Router();

router.get('/', fund.getFund);
router.post('/fees', writeLimiter, fund.recordFee);

module.exports = router;
