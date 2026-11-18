const { Router } = require('express');
const { methodNotAllowed } = require('../middleware/errorHandler');

const router = Router();

router.get('/health', (_req, res) =>
  res.json({ status: 'ok', service: 'clarke-coin-api', mode: 'development scaffold; no live payments' })
);
router.all('/health', methodNotAllowed);

module.exports = router;
