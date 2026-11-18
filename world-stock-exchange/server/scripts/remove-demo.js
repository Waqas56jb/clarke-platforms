// Deletes every row the demo seed created (is_demo = true) and the generated documents. Real accounts
// and the data imported from the old site are never flagged. Usage: npm run remove-demo
const { many, pool, withTransaction } = require('../src/db/pool');
const migrate = require('../src/db/migrate');
const { removeStored } = require('../src/utils/storage');

const TABLES = [
  'fund_ledger',
  'company_orders',
  'application_reviews',
  'application_documents',
  'applications',
  'trades',
  'holdings',
  'watchlist',
  'users',
];

async function main() {
  await migrate();
  const files = (
    await many(
      `SELECT stored_path FROM application_documents
       WHERE is_demo OR application_id IN (SELECT id FROM applications WHERE is_demo)`
    )
  ).map((r) => r.stored_path);
  const counts = await withTransaction(async (client) => {
    const result = {};
    for (const table of TABLES) result[table] = (await client.query(`DELETE FROM ${table} WHERE is_demo`)).rowCount;
    return result;
  });
  await removeStored(...files);
  console.info('[demo] removed rows:', JSON.stringify(counts));
  console.info(`[demo] removed files: ${files.length}`);
}

main()
  .catch((err) => {
    console.error('[demo] removal failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
