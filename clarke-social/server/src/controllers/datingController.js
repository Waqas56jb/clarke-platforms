const datingService = require('../services/datingService');

const targetId = (req) => Number(req.params.id);

function getMe(req, res) {
  res.json({ profile: datingService.getProfile(req.user.sub), subscription: datingService.datingTier(req.user.sub) });
}

function saveMe(req, res) {
  datingService.saveProfile(req.user.sub, req.body || {});
  res.json({ ok: true });
}

function discover(req, res) {
  res.json(datingService.discover(req.user.sub));
}

function like(req, res) {
  res.json(datingService.like(req.user.sub, targetId(req)));
}

function matches(req, res) {
  res.json({ matches: datingService.matches(req.user.sub) });
}

function block(req, res) {
  datingService.block(req.user.sub, targetId(req));
  res.json({ ok: true });
}

function report(req, res) {
  datingService.report(req.user.sub, targetId(req), req.body?.reason);
  res.status(201).json({ ok: true });
}

module.exports = { getMe, saveMe, discover, like, matches, block, report };
