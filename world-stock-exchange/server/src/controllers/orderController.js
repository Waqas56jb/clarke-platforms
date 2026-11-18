const orderService = require('../services/orderService');

function list(_req, res) {
  res.json({ orders: orderService.list() });
}

function create(req, res) {
  res.status(201).json(orderService.placeOrder(req.body?.applicationId, req.body?.quantity));
}

module.exports = { list, create };
