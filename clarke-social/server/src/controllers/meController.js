const userService = require('../services/userService');
const { activePlans } = require('../services/membershipService');
const { unreadCount } = require('../services/messageService');
const { clearSessionCookie } = require('../utils/sessionCookie');
const { toAccount } = require('../utils/serializers');

async function getMe(req, res) {
  res.json({
    user: toAccount(req.user),
    plans: await activePlans(req.user.id),
    unreadMessages: await unreadCount(req.user.id),
  });
}

async function updateMe(req, res) {
  res.json({ user: toAccount(await userService.updateProfile(req.user.id, req.body || {})) });
}

async function deleteMe(req, res) {
  await userService.deleteAccount(req.user, req.body?.password);
  clearSessionCookie(res);
  res.json({ ok: true, message: 'Your account and everything you posted have been deleted.' });
}

module.exports = { getMe, updateMe, deleteMe };
