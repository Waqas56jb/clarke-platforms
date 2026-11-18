const { Router } = require('express');
const { writeLimiter } = require('../middleware/rateLimits');
const orders = require('../controllers/orderController');

const router = Router();

router.get('/', orders.list);
router.post('/', writeLimiter, orders.create);

module.exports = router;
