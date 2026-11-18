// Reviewer decisions on listing applications. Every decision is recorded with the reviewer and time.
const { one, many, withTransaction } = require('../db/pool');
const HttpError = require('../utils/httpError');
const { SELECT, withDetails } = require('./applicationService');

const STATUSES = ['pending', 'approved', 'rejected'];

async function list(status) {
  const filter = STATUSES.includes(status) ? status : null;
  const rows = await many(
    `${SELECT} WHERE ($1::text IS NULL OR a.status=$1) ORDER BY (a.status='pending') DESC, a.created_at DESC`,
    [filter]
  );
  return Promise.all(rows.map(withDetails));
}

async function decide(reviewer, applicationId, body) {
  const status = body?.status;
  const note = String(body?.note || '')
    .trim()
    .slice(0, 1000);
  if (!STATUSES.includes(status)) throw new HttpError(400, 'Choose approve, reject or return to pending.');
  if (status !== 'approved' && !note) throw new HttpError(400, 'Add a note explaining this decision for the issuer.');
  const id = await withTransaction(async (client) => {
    const row = (await client.query('SELECT * FROM applications WHERE id=$1 FOR UPDATE', [Number(applicationId) || 0]))
      .rows[0];
    if (!row) throw new HttpError(404, 'Application not found.');
    if (row.issuer_id === reviewer.id) throw new HttpError(403, 'You cannot review your own application.');
    await client.query(
      'UPDATE applications SET status=$2, review_note=$3, reviewed_by=$4, reviewed_at=now() WHERE id=$1',
      [row.id, status, note, reviewer.id]
    );
    await client.query('INSERT INTO application_reviews(application_id,reviewer_id,status,note) VALUES($1,$2,$3,$4)', [
      row.id,
      reviewer.id,
      status,
      note,
    ]);
    return row.id;
  });
  return withDetails(await one(`${SELECT} WHERE a.id=$1`, [id]));
}

module.exports = { list, decide };
