const messageService = require('../services/messageService');

const other = (req) => Number(req.params.userId);

async function conversations(req, res) {
  res.json({ conversations: await messageService.conversations(req.user.id) });
}

async function contacts(req, res) {
  res.json({ contacts: await messageService.contacts(req.user.id) });
}

async function unread(req, res) {
  res.json({ unread: await messageService.unreadCount(req.user.id) });
}

async function thread(req, res) {
  res.json(await messageService.thread(req.user.id, other(req)));
}

async function send(req, res) {
  res.status(201).json({ message: await messageService.send(req.user.id, other(req), req.body?.body) });
}

async function markRead(req, res) {
  await messageService.markRead(req.user.id, other(req));
  res.json({ ok: true });
}

module.exports = { conversations, contacts, unread, thread, send, markRead };
