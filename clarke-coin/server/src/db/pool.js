const { Pool } = require('pg');
const env = require('../config/env');

// pool_size 5 + max_overflow 10 in the SQLAlchemy engine.
const pool = new Pool({ connectionString: env.databaseUrl, max: 15 });

// Runs fn inside a single database transaction, rolling back on any error.
async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { pool, withTransaction };
