// One-time import of the previous SQLite demo database into PostgreSQL. Runs at start-up when
// LEGACY_SQLITE_PATH points at the old file and the import has not been done yet. Known test data from
// earlier deployment checks is skipped. Imported applications have no owner account (issuer_id NULL).
const fs = require('fs');
const env = require('../config/env');
const { one, withTransaction } = require('../db/pool');

const EVENT = 'legacy_sqlite_import';
const TEST_COMPANIES = ['prod check ltd'];
const TEST_FUND_FEE_CENTS = 2000; // the €20.00 test fund entry
const STATUS = { 'Pending review': 'pending', Approved: 'approved', Rejected: 'rejected' };

async function importLegacy() {
  const file = env.legacySqlitePath;
  if (!file || !fs.existsSync(file)) return;
  if (await one('SELECT 1 FROM app_events WHERE name=$1', [EVENT])) return;

  const Database = require('better-sqlite3');
  const db = new Database(file, { readonly: true, fileMustExist: true });
  const apps = db.prepare('SELECT * FROM issuer_applications ORDER BY created_at').all();
  const orders = db.prepare('SELECT * FROM company_orders ORDER BY created_at').all();
  const fund = db.prepare('SELECT * FROM fund_ledger ORDER BY id').all();
  db.close();

  const report = await withTransaction(async (client) => {
    const ids = new Map();
    const log = { applications: [], skipped: [], orders: 0, ordersSkipped: 0, fund: 0, fundSkipped: 0 };
    for (const a of apps) {
      if (TEST_COMPANIES.includes(String(a.name).trim().toLowerCase())) {
        log.skipped.push(`${a.id} ${a.name}`);
        continue;
      }
      const row = (
        await client.query(
          `INSERT INTO applications(reference,issuer_id,name,country,symbol,sector,website,contact_email,share_class,
             shares,remaining_shares,price,currency,description,status,created_at)
           VALUES($1,NULL,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
           ON CONFLICT(reference) DO NOTHING RETURNING id`,
          [
            a.id,
            a.name,
            a.country,
            a.symbol,
            a.sector,
            a.website,
            a.email,
            a.share_class,
            a.shares,
            a.remaining_shares,
            a.price,
            a.currency,
            a.description,
            STATUS[a.status] || 'pending',
            a.created_at,
          ]
        )
      ).rows[0];
      if (row) {
        ids.set(a.id, row.id);
        log.applications.push(`${a.id} ${a.name} (${a.status})`);
      }
    }
    for (const o of orders) {
      if (!ids.has(o.application_id)) {
        log.ordersSkipped += 1;
        continue;
      }
      await client.query(
        `INSERT INTO company_orders(reference,application_id,investor_id,quantity,price,currency,total_cents,created_at)
         VALUES($1,$2,NULL,$3,$4,$5,$6,$7) ON CONFLICT(reference) DO NOTHING`,
        [o.id, ids.get(o.application_id), o.quantity, o.price, o.currency, Math.round(o.total * 100), o.created_at]
      );
      log.orders += 1;
    }
    for (const f of fund) {
      if (f.fee_cents === TEST_FUND_FEE_CENTS) {
        log.fundSkipped += 1;
        continue;
      }
      await client.query(
        `INSERT INTO fund_ledger(order_id,sale_value_eur_cents,basis_eur_cents,fee_eur_cents,basis,rate,created_at)
         VALUES(NULL,$1,$1,$2,'legacy',0.02,$3)`,
        [f.sale_value_cents, f.fee_cents, f.created_at]
      );
      log.fund += 1;
    }
    await client.query('INSERT INTO app_events(name) VALUES($1)', [EVENT]);
    return log;
  });
  console.info('Legacy SQLite import:', JSON.stringify(report));
}

module.exports = importLegacy;
