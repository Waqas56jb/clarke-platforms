const fundService = require('../services/fundService');

function getFund(_req, res) {
  res.json({ total: fundService.totalEur() });
}

function recordFee(req, res) {
  res.status(201).json(fundService.recordFee(req.body?.saleValue));
}

module.exports = { getFund, recordFee };
