const db = require('../db/connection');
const HttpError = require('../utils/httpError');
const { makeIdFactory } = require('../utils/ids');
const { text, oneOf, isHttpUrl } = require('../utils/validation');

const SECTORS = [
  'Technology',
  'Energy / Oil & Gas',
  'Agriculture',
  'Mining & Materials',
  'Manufacturing',
  'Financial Services',
  'Healthcare',
  'Other',
];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'GYD', 'XCD'];
const STATUSES = ['Pending review', 'Approved', 'Rejected'];

const newId = makeIdFactory('WSE', (id) => !!db.prepare('SELECT 1 FROM issuer_applications WHERE id=?').get(id));

const toApplication = (r) => ({
  id: r.id,
  name: r.name,
  country: r.country,
  symbol: r.symbol,
  sector: r.sector,
  website: r.website,
  email: r.email,
  shareClass: r.share_class,
  shares: r.shares,
  remainingShares: r.remaining_shares,
  price: r.price,
  currency: r.currency,
  description: r.description,
  files: JSON.parse(r.files),
  status: r.status,
  createdAt: r.created_at,
});

const findRow = (id) => db.prepare('SELECT * FROM issuer_applications WHERE id=?').get(id);

function list() {
  return db.prepare('SELECT * FROM issuer_applications ORDER BY created_at DESC, id DESC').all().map(toApplication);
}

function parseSubmission(body) {
  if (body.declaration !== true) throw new HttpError(400, 'The authorization declaration must be confirmed.');
  const website = text(body.website, 'Company website', { max: 300, required: false });
  if (website && !isHttpUrl(website)) throw new HttpError(400, 'Company website must be a valid URL.');
  const email = text(body.email, 'Authorized contact email', { max: 200 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'Authorized contact email is not valid.');
  const shares = Number(body.shares);
  if (!Number.isSafeInteger(shares) || shares < 1)
    throw new HttpError(400, 'Number of shares offered must be a whole number of at least 1.');
  const price = Number(body.price);
  if (!Number.isFinite(price) || price < 0.0001)
    throw new HttpError(400, 'Proposed offer price per share must be at least 0.0001.');
  const files = Array.isArray(body.files) ? body.files : [];
  if (files.length > 4 || files.some((f) => typeof f !== 'string' || !f || f.length > 255))
    throw new HttpError(400, 'Documents selected must be up to four file names.');
  return {
    name: text(body.name, 'Registered company name', { max: 120 }),
    country: text(body.country, 'Country of incorporation', { max: 80 }),
    symbol: text(body.symbol, 'Proposed ticker / share symbol', { max: 12 }).toUpperCase(),
    sector: oneOf(body.sector, 'Industry / sector', SECTORS),
    website,
    email,
    shareClass: text(body.shareClass, 'Share class', { max: 120 }),
    shares,
    price,
    currency: oneOf(body.currency, 'Offer currency', CURRENCIES),
    description: text(body.description, 'Company profile and business description', { max: 600 }),
    files,
  };
}

function create(body) {
  const a = parseSubmission(body || {});
  const id = newId();
  db.prepare(
    `INSERT INTO issuer_applications(id,name,country,symbol,sector,website,email,share_class,shares,remaining_shares,price,currency,description,files,created_at)
     VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).run(
    id,
    a.name,
    a.country,
    a.symbol,
    a.sector,
    a.website,
    a.email,
    a.shareClass,
    a.shares,
    a.shares,
    a.price,
    a.currency,
    a.description,
    JSON.stringify(a.files),
    new Date().toISOString()
  );
  return toApplication(findRow(id));
}

function setStatus(id, status) {
  oneOf(status, 'Status', STATUSES);
  const result = db.prepare('UPDATE issuer_applications SET status=? WHERE id=?').run(status, id);
  if (!result.changes) throw new HttpError(404, 'Application not found.');
  return toApplication(findRow(id));
}

module.exports = { list, create, setStatus, findRow, toApplication };
