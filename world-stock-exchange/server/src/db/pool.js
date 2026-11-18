const { Pool, types } = require('pg');
const env = require('../config/env');

// Return DATE columns as 'YYYY-MM-DD' strings (birth dates) instead of local-midnight Date objects.
types.setTypeParser(1082, (value) => value);

const pool = new Pool({ connectionString: env.databaseUrl, max: 15 });

const query = (text, params) => pool.query(text, params);
const one = async (text, params) => (await pool.query(text, params)).rows[0] || null;
const many = async (text, params) => (await pool.query(text, params)).rows;

// Runs fn(client) inside one transaction, rolling back on any error.
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

module.exports = { pool, query, one, many, withTransaction };
