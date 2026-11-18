const userService = require('../services/userService');

function follow(req, res) {
  res.json({ following: userService.toggleFollow(req.user.sub, Number(req.params.id)) });
}

function followLegacy(req, res) {
  res.json({ following: userService.followLegacy(req.user.sub, Number(req.params.userId)) });
}

function search(req, res) {
  res.json({ users: userService.search(req.query.q) });
}

module.exports = { follow, followLegacy, search };
