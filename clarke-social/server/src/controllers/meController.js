const { findUserById } = require('../services/authService');
const userService = require('../services/userService');
const { safeUser } = require('../utils/serializers');

function getMe(req, res) {
  const user = findUserById(req.user.sub);
  if (!user) return res.status(401).json({ error: 'Account not found.' });
  res.json({ user: safeUser(user) });
}

function updateMe(req, res) {
  res.json({ user: safeUser(userService.updateProfile(req.user.sub, req.body)) });
}

module.exports = { getMe, updateMe };
