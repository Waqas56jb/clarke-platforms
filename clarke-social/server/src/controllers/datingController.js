const datingService = require('../services/datingService');

const targetId = (req) => Number(req.params.id);

async function getMe(req, res) {
  res.json({
    profile: await datingService.getProfile(req.user.id),
    subscription: await datingService.datingTier(req.user.id),
  });
}

async function saveMe(req, res) {
  await datingService.saveProfile(req.user.id, req.body || {});
  res.json({ ok: true });
}

async function discover(req, res) {
  res.json(await datingService.discover(req.user.id));
}

async function like(req, res) {
  res.json(await datingService.like(req.user.id, targetId(req)));
}

async function matches(req, res) {
  res.json({ matches: await datingService.matches(req.user.id) });
}

async function block(req, res) {
  await datingService.block(req.user.id, targetId(req));
  res.json({ ok: true });
}

async function report(req, res) {
  await datingService.report(req.user.id, targetId(req), req.body?.reason);
  res.status(201).json({ ok: true });
}

module.exports = { getMe, saveMe, discover, like, matches, block, report };
