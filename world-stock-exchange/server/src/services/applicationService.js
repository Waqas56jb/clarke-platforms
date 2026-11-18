// Issuer listing applications and their private documents. Applications are only visible to their
// issuer and to reviewers; the public only ever sees approved listings (listingService).
const crypto = require('crypto');
const { one, many, query } = require('../db/pool');
const HttpError = require('../utils/httpError');
const { iso } = require('../utils/serializers');
const { removeStored } = require('../utils/storage');

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
const DOCUMENT_KINDS = {
  prospectus: 'Prospectus',
  financials: 'Financial statements',
  incorporation: 'Certificate of incorporation',
  regulatory: 'Regulatory evidence',
};
const MAX_DOCUMENTS = 8;

function text(value, label, { max, required = true }) {
  const v = String(value ?? '').trim();
  if (required && !v) throw new HttpError(400, `${label} is required.`);
  if (v.length > max) throw new HttpError(400, `${label} must be ${max} characters or fewer.`);
  return v;
}

function oneOf(value, label, options) {
  if (!options.includes(value)) throw new HttpError(400, `Choose a valid ${label.toLowerCase()}.`);
  return value;
}

function parseApplication(body) {
  if (body.declaration !== true) throw new HttpError(400, 'The authorization declaration must be confirmed.');
  const website = text(body.website, 'Company website', { max: 300, required: false });
  if (website && !/^https?:\/\/[^\s]+\.[^\s]+$/i.test(website))
    throw new HttpError(400, 'Company website must be a valid URL.');
  const email = text(body.email, 'Authorized contact email', { max: 200 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'Authorized contact email is not valid.');
  const shares = Number(body.shares);
  if (!Number.isSafeInteger(shares) || shares < 1 || shares > 1e12)
    throw new HttpError(400, 'Number of shares offered must be a whole number of at least 1.');
  const price = Number(body.price);
  if (!Number.isFinite(price) || price < 0.0001 || price > 1e9)
    throw new HttpError(400, 'Proposed offer price per share must be at least 0.0001.');
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
  };
}

const newReference = () => `WSE-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

const toDocument = (d) => ({
  id: d.id,
  kind: d.kind,
  kindLabel: DOCUMENT_KINDS[d.kind],
  name: d.original_name,
  type: d.mime_type,
  size: d.size_bytes,
  uploadedAt: iso(d.created_at),
});

const toApplication = (a, documents = [], reviews = []) => ({
  id: a.id,
  reference: a.reference,
  issuerId: a.issuer_id,
  issuerName: a.issuer_name || null,
  name: a.name,
  country: a.country,
  symbol: a.symbol,
  sector: a.sector,
  website: a.website,
  email: a.contact_email,
  shareClass: a.share_class,
  shares: Number(a.shares),
  remainingShares: Number(a.remaining_shares),
  price: Number(a.price),
  currency: a.currency,
  description: a.description,
  status: a.status,
  reviewNote: a.review_note,
  reviewedBy: a.reviewer_name || null,
  reviewedAt: iso(a.reviewed_at),
  createdAt: iso(a.created_at),
  documents: documents.map(toDocument),
  reviews: reviews.map((r) => ({ status: r.status, note: r.note, reviewer: r.reviewer_name, at: iso(r.created_at) })),
});

const SELECT = `SELECT a.*, iu.display_name issuer_name, ru.display_name reviewer_name
  FROM applications a LEFT JOIN users iu ON iu.id=a.issuer_id LEFT JOIN users ru ON ru.id=a.reviewed_by`;

async function withDetails(row) {
  const documents = await many('SELECT * FROM application_documents WHERE application_id=$1 ORDER BY id', [row.id]);
  const reviews = await many(
    `SELECT r.*, u.display_name reviewer_name FROM application_reviews r LEFT JOIN users u ON u.id=r.reviewer_id
     WHERE r.application_id=$1 ORDER BY r.created_at DESC`,
    [row.id]
  );
  return toApplication(row, documents, reviews);
}

async function create(issuer, body) {
  const a = parseApplication(body || {});
  const row = await one(
    `INSERT INTO applications(reference,issuer_id,name,country,symbol,sector,website,contact_email,share_class,
       shares,remaining_shares,price,currency,description)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$10,$11,$12,$13) RETURNING id`,
    [
      newReference(),
      issuer.id,
      a.name,
      a.country,
      a.symbol,
      a.sector,
      a.website,
      a.email,
      a.shareClass,
      a.shares,
      a.price,
      a.currency,
      a.description,
    ]
  );
  return get(issuer, row.id);
}

async function mine(issuerId) {
  const rows = await many(`${SELECT} WHERE a.issuer_id=$1 ORDER BY a.created_at DESC`, [issuerId]);
  return Promise.all(rows.map(withDetails));
}

// The issuer who owns the application, or any reviewer.
async function requireAccess(user, applicationId) {
  const row = await one(`${SELECT} WHERE a.id=$1`, [Number(applicationId) || 0]);
  if (!row || (row.issuer_id !== user.id && !user.is_reviewer)) throw new HttpError(404, 'Application not found.');
  return row;
}

async function get(user, applicationId) {
  return withDetails(await requireAccess(user, applicationId));
}

// Documents can be added by the issuer while the application is still pending review.
async function addDocument(user, applicationId, kind, upload) {
  try {
    const row = await requireAccess(user, applicationId);
    if (row.issuer_id !== user.id) throw new HttpError(403, 'Only the issuer can add documents to an application.');
    if (row.status !== 'pending')
      throw new HttpError(409, 'Documents can only be added while the application is pending review.');
    if (!DOCUMENT_KINDS[kind]) throw new HttpError(400, 'Choose which document this is.');
    const { n } = await one('SELECT COUNT(*)::int n FROM application_documents WHERE application_id=$1', [row.id]);
    if (n >= MAX_DOCUMENTS) throw new HttpError(400, `An application can have up to ${MAX_DOCUMENTS} documents.`);
    const doc = await one(
      `INSERT INTO application_documents(application_id,kind,original_name,stored_path,mime_type,size_bytes)
       VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
      [row.id, kind, upload.originalName, upload.stored, upload.type, upload.size]
    );
    return toDocument(doc);
  } catch (err) {
    await removeStored(upload.stored);
    throw err;
  }
}

// Permission check for a document download (issuer owner or reviewer); returns the stored row.
async function requireDocument(user, applicationId, documentId) {
  const row = await requireAccess(user, applicationId);
  const doc = await one('SELECT * FROM application_documents WHERE id=$1 AND application_id=$2', [
    Number(documentId) || 0,
    row.id,
  ]);
  if (!doc) throw new HttpError(404, 'Document not found.');
  return doc;
}

async function removeDocument(user, applicationId, documentId) {
  const doc = await requireDocument(user, applicationId, documentId);
  const app = await one('SELECT issuer_id, status FROM applications WHERE id=$1', [doc.application_id]);
  if (app.issuer_id !== user.id || app.status !== 'pending')
    throw new HttpError(403, 'Only the issuer can remove documents while the application is pending.');
  await query('DELETE FROM application_documents WHERE id=$1', [doc.id]);
  await removeStored(doc.stored_path);
}

module.exports = {
  SECTORS,
  CURRENCIES,
  DOCUMENT_KINDS,
  SELECT,
  create,
  mine,
  get,
  withDetails,
  addDocument,
  requireDocument,
  removeDocument,
  toApplication,
};
