const userService = require('../services/userService');
const searchService = require('../services/searchService');
const { block } = require('../services/blockService');

const viewer = (req) => req.user?.id || 0;

async function follow(req, res) {
  res.json({ following: await userService.toggleFollow(req.user.id, Number(req.params.id)) });
}

async function blockUser(req, res) {
  await block(req.user.id, Number(req.params.id));
  res.json({ ok: true, message: 'Member blocked. They can no longer message, call or find you in dating.' });
}

async function searchUsers(req, res) {
  res.json({ users: await userService.search(viewer(req), req.query.q) });
}

async function suggestions(req, res) {
  res.json({ users: await userService.suggestions(viewer(req)) });
}

async function profile(req, res) {
  res.json({ user: await userService.profile(viewer(req), Number(req.params.id)) });
}

async function search(req, res) {
  res.json(await searchService.search(viewer(req), req.query.q));
}

async function trending(_req, res) {
  res.json({ tags: await searchService.trending() });
}

module.exports = { follow, blockUser, searchUsers, suggestions, profile, search, trending };
