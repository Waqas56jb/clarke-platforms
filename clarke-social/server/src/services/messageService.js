// Encrypted-envelope storage carried over from the Clarke Social starter. The server accepts
// ciphertext only and never encrypts or decrypts. Clients must encrypt with a vetted Signal
// Protocol implementation before sending; none is integrated yet, so the UI keeps chat disabled.
const db = require('../db/connection');
const HttpError = require('../utils/httpError');

function storeEnvelope(senderId, { recipientId, ciphertext, nonce }) {
  if (
    !Number.isInteger(Number(recipientId)) ||
    typeof ciphertext !== 'string' ||
    typeof nonce !== 'string' ||
    ciphertext.length > 200000 ||
    nonce.length > 200
  )
    throw new HttpError(400, 'Invalid encrypted message envelope.');
  const recipient = db.prepare('SELECT id FROM users WHERE id=?').get(Number(recipientId));
  if (!recipient) throw new HttpError(404, 'Recipient not found.');
  const info = db
    .prepare('INSERT INTO messages(sender_id,recipient_id,ciphertext,nonce) VALUES(?,?,?,?)')
    .run(senderId, recipient.id, ciphertext, nonce);
  return { id: info.lastInsertRowid, recipientId: recipient.id };
}

function conversation(userId, otherId) {
  const rows = db
    .prepare(
      'SELECT id,sender_id,recipient_id,ciphertext,nonce,created_at FROM messages WHERE (sender_id=? AND recipient_id=?) OR (sender_id=? AND recipient_id=?) ORDER BY id DESC LIMIT 100'
    )
    .all(userId, otherId, otherId, userId);
  return rows.reverse();
}

module.exports = { storeEnvelope, conversation };
