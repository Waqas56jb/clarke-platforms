const issuerService = require('../services/issuerService');

function list(_req, res) {
  res.json({ applications: issuerService.list() });
}

function create(req, res) {
  res.status(201).json({ application: issuerService.create(req.body) });
}

function setStatus(req, res) {
  res.json({ application: issuerService.setStatus(req.params.id, req.body?.status) });
}

module.exports = { list, create, setStatus };
