// Account settings: display name, the issuer role, and account deletion.
const bcrypt = require('bcryptjs');
const { one, many, query } = require('../db/pool');
const HttpError = require('../utils/httpError');
const { removeStored } = require('../utils/storage');

async function updateProfile(userId, body) {
  const fields = [];
  const params = [userId];
  if (body.displayName !== undefined) {
    const name = String(body.displayName).trim().slice(0, 60);
    if (!name) throw new HttpError(400, 'Enter a display name.');
    params.push(name);
    fields.push(`display_name=$${params.length}`);
  }
  // Any account can become an issuer (and stop being one). Reviewer can never be set here.
  if (body.issuer !== undefined) {
    params.push(Boolean(body.issuer));
    fields.push(`is_issuer=$${params.length}`);
  }
  if (!fields.length) return one('SELECT * FROM users WHERE id=$1', [userId]);
  return one(`UPDATE users SET ${fields.join(',')} WHERE id=$1 RETURNING *`, params);
}

// Deletes the account and the documents of its listing applications (rows cascade).
async function deleteAccount(user, password) {
  if (!password || !(await bcrypt.compare(String(password), user.password_hash)))
    throw new HttpError(403, 'That password is not correct.');
  const files = await many(
    'SELECT d.stored_path FROM application_documents d JOIN applications a ON a.id=d.application_id WHERE a.issuer_id=$1',
    [user.id]
  );
  await query('DELETE FROM users WHERE id=$1', [user.id]);
  await removeStored(...files.map((f) => f.stored_path));
}

module.exports = { updateProfile, deleteAccount };
