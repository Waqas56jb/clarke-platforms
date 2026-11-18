// Signed, short-lived document links served straight from the API host. Permission (issuer owner or
// reviewer) is checked again on every request, so a link stops working as soon as access is withdrawn.
const { Router } = require('express');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');
const { one } = require('../db/pool');
const { verifyToken } = require('../utils/tokens');
const { diskPath } = require('../utils/storage');
const applications = require('../services/applicationService');

const router = Router();

router.get(
  '/document/:token',
  asyncHandler(async (req, res) => {
    let payload;
    try {
      payload = verifyToken(req.params.token, 'file');
    } catch {
      throw new HttpError(403, 'This link has expired. Go back and try again.');
    }
    if (payload.kind !== 'document') throw new HttpError(403, 'This link is not valid.');
    const user = await one('SELECT * FROM users WHERE id=$1', [payload.sub]);
    const doc = await one('SELECT * FROM application_documents WHERE id=$1', [payload.id]);
    if (!user || !doc) throw new HttpError(404, 'Document not found.');
    await applications.requireDocument(user, doc.application_id, doc.id);
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Cache-Control', 'private, no-store');
    res.download(diskPath(doc.stored_path), doc.original_name);
  })
);

module.exports = router;
