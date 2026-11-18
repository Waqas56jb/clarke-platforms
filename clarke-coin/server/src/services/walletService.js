const { pool } = require('../db/pool');
const HttpError = require('../utils/httpError');
const { isoTimestampSql, toPythonIso } = require('../utils/isoformat');

async function walletFor(userId, db = pool, { forUpdate = false } = {}) {
  const sql = `SELECT * FROM wallets WHERE user_id=$1${forUpdate ? ' FOR UPDATE' : ''}`;
  return (await db.query(sql, [userId])).rows[0] || null;
}

async function requireWallet(userId) {
  const wallet = await walletFor(userId);
  if (!wallet) throw new HttpError(404, 'Wallet not found');
  return wallet;
}

// The balance is always derived from ledger postings; there is no editable balance column.
async function ledgerBalance(walletId, db = pool) {
  const { rows } = await db.query(
    'SELECT COALESCE(SUM(amount), 0)::text AS balance FROM ledger_entries WHERE wallet_id=$1',
    [walletId]
  );
  return rows[0].balance;
}

async function getBalance(userId) {
  const wallet = await requireWallet(userId);
  return { currency: wallet.currency, balance: await ledgerBalance(wallet.id), status: wallet.status };
}

async function listTransactions(userId, limit, offset) {
  const wallet = await requireWallet(userId);
  const { rows } = await pool.query(
    `SELECT t.reference, t.transaction_type, t.status, e.amount::text AS amount, ${isoTimestampSql('t.created_at')} AS created_at
     FROM ledger_transactions t JOIN ledger_entries e ON e.transaction_id = t.id
     WHERE e.wallet_id = $1 ORDER BY t.created_at DESC LIMIT $2 OFFSET $3`,
    [wallet.id, Math.max(1, Math.min(limit, 100)), Math.max(0, offset)]
  );
  return rows.map((r) => ({ ...r, created_at: toPythonIso(r.created_at) }));
}

module.exports = { walletFor, ledgerBalance, getBalance, listTransactions };
