// Demonstration company-share orders. No payment, share transfer or legal purchase takes place.
const db = require('../db/connection');
const HttpError = require('../utils/httpError');
const { makeIdFactory } = require('../utils/ids');
const { findRow, toApplication } = require('./issuerService');

const newId = makeIdFactory('DEMO', (id) => !!db.prepare('SELECT 1 FROM company_orders WHERE id=?').get(id));

const toOrder = (r) => ({
  id: r.id,
  applicationId: r.application_id,
  company: r.company,
  symbol: r.symbol,
  quantity: r.quantity,
  price: r.price,
  currency: r.currency,
  total: r.total,
  createdAt: r.created_at,
});

function list() {
  return db.prepare('SELECT * FROM company_orders ORDER BY created_at DESC, id DESC').all().map(toOrder);
}

const placeOrder = db.transaction((applicationId, quantityInput) => {
  const app = findRow(String(applicationId || ''));
  const q = Math.floor(Number(quantityInput) || 0);
  if (!app || app.status !== 'Approved' || q < 1)
    throw new HttpError(400, 'Choose an approved listing and enter at least one share.');
  if (q > app.remaining_shares)
    throw new HttpError(
      409,
      `Only ${app.remaining_shares.toLocaleString()} shares remain in this demonstration listing.`
    );
  db.prepare('UPDATE issuer_applications SET remaining_shares=remaining_shares-? WHERE id=?').run(q, app.id);
  const id = newId();
  db.prepare(
    'INSERT INTO company_orders(id,application_id,company,symbol,quantity,price,currency,total,created_at) VALUES(?,?,?,?,?,?,?,?,?)'
  ).run(id, app.id, app.name, app.symbol, q, app.price, app.currency, q * app.price, new Date().toISOString());
  return {
    order: toOrder(db.prepare('SELECT * FROM company_orders WHERE id=?').get(id)),
    application: toApplication(findRow(app.id)),
  };
});

module.exports = { list, placeOrder };
