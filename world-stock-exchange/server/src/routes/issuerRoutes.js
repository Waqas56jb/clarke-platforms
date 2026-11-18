const { Router } = require('express');
const { writeLimiter } = require('../middleware/rateLimits');
const issuers = require('../controllers/issuerController');

const router = Router();

router.get('/', issuers.list);
router.post('/', writeLimiter, issuers.create);
// Prototype review control, as on the original page; not a secure administrator approval process.
router.patch('/:id/status', writeLimiter, issuers.setStatus);

module.exports = router;
