// Listing documents are stored privately and only ever served through permission-checked links.
const fs = require('fs');
const path = require('path');
const env = require('../config/env');

fs.mkdirSync(env.privateDir, { recursive: true });

const privatePath = (filename) => `private:${filename}`;

// Maps a stored path back to a file on disk, refusing anything outside the private folder.
function diskPath(stored) {
  if (!stored || !stored.startsWith('private:')) return null;
  return path.join(env.privateDir, path.basename(stored.slice(8)));
}

async function removeStored(...stored) {
  await Promise.all(
    stored
      .map(diskPath)
      .filter(Boolean)
      .map((p) => fs.promises.unlink(p).catch(() => {}))
  );
}

module.exports = { privatePath, diskPath, removeStored };
