// Internal transfers. Intentionally unavailable until compliance, wallet activation, operational
// controls and independent security review are complete: every wallet starts "restricted" and no
// endpoint can activate one, mint coins, credit accounts or start bank/card payments.
const crypto = require('crypto');
const { withTransaction } = require('../db/pool');
const HttpError = require('../utils/httpError');
const { walletFor, ledgerBalance } = require('./walletService');

const UNIQUE_VIOLATION = '23505';
const ALREADY_PROCESSED = 'This request has already been processed';

async function transfer(user, { recipientEmail, amount }, idempotencyKey) {
  try {
    return await withTransaction(async (db) => {
      const sender = await walletFor(user.id, db, { forUpdate: true });
      if (!sender || sender.status !== 'active')
        throw new HttpError(403, 'Wallet transfers are not enabled for this account');
      const seen = await db.query('SELECT 1 FROM ledger_transactions WHERE idempotency_key=$1', [idempotencyKey]);
      if (seen.rowCount) throw new HttpError(409, ALREADY_PROCESSED);
      const recipientUser = (
        await db.query('SELECT id FROM users WHERE email=$1 AND is_active IS true', [
          recipientEmail.toLowerCase().trim(),
        ])
      ).rows[0];
      const recipient = recipientUser ? await walletFor(recipientUser.id, db, { forUpdate: true }) : null;
      if (!recipient || recipient.status !== 'active' || recipient.id === sender.id)
        throw new HttpError(400, 'Recipient account is unavailable');
      const sufficient = await db.query('SELECT $1::numeric >= $2::numeric AS ok', [
        await ledgerBalance(sender.id, db),
        amount,
      ]);
      if (!sufficient.rows[0].ok) throw new HttpError(400, 'Insufficient available balance');

      // Double entry: one debit and one equal credit under a single transaction header.
      const txId = crypto.randomUUID();
      const reference = `CC-${crypto.randomBytes(12).toString('hex').toUpperCase()}`;
      await db.query(
        `INSERT INTO ledger_transactions(id,idempotency_key,transaction_type,status,reference,created_at)
         VALUES($1,$2,'internal_transfer','posted',$3,now())`,
        [txId, idempotencyKey, reference]
      );
      await db.query(
        `INSERT INTO ledger_entries(id,transaction_id,wallet_id,amount,created_at)
         VALUES($1,$3,$4,-($6::numeric),now()), ($2,$3,$5,$6::numeric,now())`,
        [crypto.randomUUID(), crypto.randomUUID(), txId, sender.id, recipient.id, amount]
      );
      return { reference, status: 'posted', amount, currency: sender.currency };
    });
  } catch (err) {
    // A concurrent request with the same Idempotency-Key lost the race on the unique index.
    if (err.code === UNIQUE_VIOLATION) throw new HttpError(409, ALREADY_PROCESSED);
    throw err;
  }
}

module.exports = { transfer };
