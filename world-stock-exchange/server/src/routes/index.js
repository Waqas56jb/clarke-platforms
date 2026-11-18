const { Router } = require('express');

const router = Router();

router.use('/issuers', require('./issuerRoutes'));
router.use('/orders', require('./orderRoutes'));
router.use('/fund', require('./fundRoutes'));
router.get('/health', (_req, res) => res.json({ status: 'ok', service: 'World Stock Exchange demo API' }));

module.exports = router;
