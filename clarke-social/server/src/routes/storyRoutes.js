const { Router } = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const storyService = require('../services/storyService');

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req, res) => res.json({ groups: await storyService.listActive() }))
);
router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    await storyService.remove(req.user.id, Number(req.params.id));
    res.json({ ok: true });
  })
);

module.exports = router;
