const { Router } = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const callService = require('../services/callService');

const router = Router();

router.use(requireAuth);
router.get('/ice-config', (req, res) => res.json(callService.iceConfig(req.user.id)));
router.get(
  '/history',
  asyncHandler(async (req, res) => res.json({ calls: await callService.history(req.user.id) }))
);

module.exports = router;
