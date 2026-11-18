const callService = require('../services/callService');

function iceConfig(_req, res) {
  res.json(callService.iceConfig());
}

function history(req, res) {
  res.json({ calls: callService.history(req.user.sub) });
}

module.exports = { iceConfig, history };
