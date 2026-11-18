// Seeds fictional demo data into the real tables through the API's services: issuers with applications
// in every status (with generated PDF documents), reviewer decisions, approved listings, investors with
// practice trades, watchlists, listing orders and the resulting fund-ledger entries. Every row is flagged
// is_demo. Safe to run repeatedly: existing demo rows are found by natural keys and skipped.
// If the test logins wse_investor / wse_issuer exist, they get a watchlist / their own applications.
// Usage: npm run seed-demo
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const env = require('../src/config/env');
const { one, many, query, pool } = require('../src/db/pool');
const migrate = require('../src/db/migrate');
const { privatePath } = require('../src/utils/storage');
const trading = require('../src/services/tradeService');
const applications = require('../src/services/applicationService');
const reviews = require('../src/services/reviewService');
const listings = require('../src/services/listingService');
const { ISSUERS, INVESTORS, REVIEWER, APPLICATIONS, DOCUMENTS, TRADE_SYMBOLS } = require('./demo/data');
const { pdf } = require('./demo/pdf');

const log = (...a) => console.info('[demo]', ...a);
const daysAgo = (d) => new Date(Date.now() - d * 86400000);

async function demoUser([username, displayName], flags = {}) {
  const existing = await one('SELECT * FROM users WHERE username=$1', [username]);
  if (existing) return existing.is_demo ? existing : null;
  const hash = await bcrypt.hash(crypto.randomBytes(24).toString('base64url'), 12);
  return one(
    `INSERT INTO users(username,email,password_hash,display_name,is_issuer,is_reviewer,balance_cents,is_demo,created_at)
     VALUES($1,$2,$3,$4,$5,$6,$7,true,$8) RETURNING *`,
    [
      username,
      `${username}@demo.wse.invalid`,
      hash,
      displayName,
      Boolean(flags.issuer),
      Boolean(flags.reviewer),
      env.startingBalanceCents,
      daysAgo(45),
    ]
  );
}

function storeDocument(app, kind) {
  const name = `doc-${crypto.randomBytes(16).toString('hex')}.pdf`;
  const bytes = pdf(`${DOCUMENTS[kind]} - ${app.name}`, [
    'DEMONSTRATION DOCUMENT - generated for the World Stock Exchange practice platform.',
    'This company and every figure below are fictional.',
    '',
    `Company: ${app.name} (${app.symbol})`,
    `Country of incorporation: ${app.country}`,
    `Sector: ${app.sector}`,
    `Share class: ${app.shareClass}`,
    `Shares offered: ${app.shares.toLocaleString('en-US')} at ${app.currency} ${app.price}`,
    '',
    app.description,
  ]);
  fs.writeFileSync(path.join(env.privateDir, name), bytes);
  return {
    stored: privatePath(name),
    type: 'application/pdf',
    size: bytes.length,
    originalName: `${app.symbol}-${kind}.pdf`,
  };
}

async function seedApplication(spec, owner, reviewer, index) {
  let row = await one('SELECT id, status FROM applications WHERE issuer_id=$1 AND symbol=$2', [owner.id, spec.symbol]);
  if (!row) {
    const created = await applications.create(owner, {
      ...spec,
      website: `https://example.org/${spec.symbol.toLowerCase()}`,
      email: `investors@example.org`,
      declaration: true,
    });
    row = { id: created.id, status: 'pending' };
    await query('UPDATE applications SET is_demo=true, created_at=$2 WHERE id=$1', [row.id, daysAgo(30 - index * 2)]);
    const kinds = spec.status === 'rejected' && index % 2 ? ['prospectus', 'incorporation'] : Object.keys(DOCUMENTS);
    for (const kind of kinds) await applications.addDocument(owner, row.id, kind, storeDocument(spec, kind));
    await query('UPDATE application_documents SET is_demo=true WHERE application_id=$1', [row.id]);
  }
  if (spec.status !== 'pending' && row.status === 'pending') {
    await reviews.decide(reviewer, row.id, { status: spec.status, note: spec.note });
    await query('UPDATE applications SET reviewed_at=$2 WHERE id=$1', [row.id, daysAgo(24 - index * 2)]);
    await query('UPDATE application_reviews SET is_demo=true, created_at=$2 WHERE application_id=$1', [
      row.id,
      daysAgo(24 - index * 2),
    ]);
  }
  return row.id;
}

async function seedTrades(investor, instruments, index) {
  if (await one('SELECT 1 FROM trades WHERE user_id=$1 LIMIT 1', [investor.id])) return;
  const picks = TRADE_SYMBOLS.slice(index % 4, (index % 4) + 4).map((s) => instruments[s]);
  for (const [k, inst] of picks.entries()) {
    const units = Math.max(1, Math.floor(1500 / Number(inst.price)) - k);
    const { trade } = await trading.placeTrade(investor.id, { instrumentId: inst.id, side: 'buy', units });
    await query('UPDATE trades SET created_at=$2 WHERE id=$1', [trade.id, daysAgo(20 - k * 3 - index)]);
    if (k === 1) {
      const sold = await trading.placeTrade(investor.id, {
        instrumentId: inst.id,
        side: 'sell',
        units: Math.ceil(units / 3),
      });
      await query('UPDATE trades SET created_at=$2 WHERE id=$1', [sold.trade.id, daysAgo(10 - index / 2)]);
    }
  }
  for (const inst of picks.slice(0, 3))
    await query('INSERT INTO watchlist(user_id,instrument_id,is_demo) VALUES($1,$2,true) ON CONFLICT DO NOTHING', [
      investor.id,
      inst.id,
    ]);
}

async function seedOrders(investors, listingIds) {
  for (const [i, investor] of investors.entries()) {
    for (const [k, listingId] of listingIds.entries()) {
      if ((i + k) % 3) continue;
      if (
        await one('SELECT 1 FROM company_orders WHERE investor_id=$1 AND application_id=$2', [investor.id, listingId])
      )
        continue;
      let order;
      try {
        ({ order } = await listings.buy(investor, listingId, { quantity: 50 + ((i * 37 + k * 11) % 400) }));
      } catch (err) {
        if (err.code === 'INSUFFICIENT_BALANCE' || err.code === 'SOLD_OUT') continue;
        throw err;
      }
      await query('UPDATE company_orders SET created_at=$2 WHERE id=$1', [order.id, daysAgo(18 - i - k)]);
      await query('UPDATE fund_ledger SET created_at=$2 WHERE order_id=$1', [order.id, daysAgo(18 - i - k)]);
    }
  }
}

async function markDemo() {
  const demoUsers = '(SELECT id FROM users WHERE is_demo)';
  const demoApps = '(SELECT id FROM applications WHERE is_demo)';
  await query(`UPDATE trades SET is_demo=true WHERE user_id IN ${demoUsers}`);
  await query(`UPDATE holdings SET is_demo=true WHERE user_id IN ${demoUsers}`);
  await query(`UPDATE watchlist SET is_demo=true WHERE user_id IN ${demoUsers}`);
  await query(
    `UPDATE company_orders SET is_demo=true WHERE investor_id IN ${demoUsers} OR application_id IN ${demoApps}`
  );
  await query('UPDATE fund_ledger SET is_demo=true WHERE order_id IN (SELECT id FROM company_orders WHERE is_demo)');
}

async function counts() {
  const tables = [
    'users',
    'applications',
    'application_documents',
    'application_reviews',
    'company_orders',
    'fund_ledger',
    'trades',
    'holdings',
    'watchlist',
  ];
  const result = {};
  for (const t of tables) result[t] = (await one(`SELECT COUNT(*)::int n FROM ${t} WHERE is_demo`)).n;
  return result;
}

async function main() {
  await migrate();
  const reviewer = await demoUser(REVIEWER, { reviewer: true });
  const issuers = Object.fromEntries(
    (await Promise.all(ISSUERS.map((u) => demoUser(u, { issuer: true })))).filter(Boolean).map((u) => [u.username, u])
  );
  const testIssuer = await one("SELECT * FROM users WHERE username='wse_issuer' AND is_issuer AND NOT is_demo");
  if (testIssuer) issuers.wse_issuer = testIssuer;

  const listingIds = [];
  for (const [i, spec] of APPLICATIONS.entries()) {
    const owner = issuers[spec.owner];
    if (!owner) continue;
    const id = await seedApplication(spec, owner, reviewer, i);
    if (spec.status === 'approved') listingIds.push(id);
  }
  log(`applications ready: ${listingIds.length} approved listings`);

  const instruments = Object.fromEntries((await many('SELECT * FROM instruments')).map((r) => [r.symbol, r]));
  const investors = [];
  for (const [i, spec] of INVESTORS.entries()) {
    const investor = await demoUser(spec);
    if (!investor) continue;
    investors.push(investor);
    await seedTrades(investor, instruments, i);
  }
  await seedOrders(investors, listingIds);

  const testInvestor = await one("SELECT id FROM users WHERE username='wse_investor' AND NOT is_demo");
  if (testInvestor)
    for (const s of ['AAPL', 'EURUSD', 'COFFEE', 'SAP'])
      await query('INSERT INTO watchlist(user_id,instrument_id,is_demo) VALUES($1,$2,true) ON CONFLICT DO NOTHING', [
        testInvestor.id,
        instruments[s].id,
      ]);

  await markDemo();
  log('demo rows:', JSON.stringify(await counts()));
  log('done');
}

main()
  .catch((err) => {
    console.error('[demo] seed failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
