const messageService = require('../services/messageService');

function send(req, res) {
  const { ciphertext, nonce } = req.body || {};
  const { id, recipientId } = messageService.storeEnvelope(req.user.sub, req.body || {});
  req.app.get('io').to(`user:${recipientId}`).emit('message:new', { id, senderId: req.user.sub, ciphertext, nonce });
  res.status(201).json({ id });
}

function conversation(req, res) {
  res.json(messageService.conversation(req.user.sub, Number(req.params.userId)));
}

module.exports = { send, conversation };
