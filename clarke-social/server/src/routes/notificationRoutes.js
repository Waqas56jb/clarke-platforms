const { Router } = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const notifications = require('../services/notificationService');

const router = Router();

router.use(requireAuth);
router.get(
  '/',
  asyncHandler(async (req, res) => res.json(await notifications.list(req.user.id)))
);
router.post(
  '/read',
  asyncHandler(async (req, res) => {
    await notifications.markAllRead(req.user.id);
    res.json({ ok: true });
  })
);

module.exports = router;
