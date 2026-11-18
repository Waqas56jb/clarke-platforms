// Upload locations. Public files are served at /uploads; private files (rights evidence, full movies)
// are only streamed through signed, permission-checked links.
const fs = require('fs');
const path = require('path');
const env = require('../config/env');

fs.mkdirSync(env.uploadDir, { recursive: true });
fs.mkdirSync(env.privateDir, { recursive: true });

const publicPath = (filename) => `/uploads/${filename}`;
const privatePath = (filename) => `private:${filename}`;

// Maps a stored path back to a file on disk, refusing anything outside the upload folders.
function diskPath(stored) {
  if (!stored) return null;
  if (stored.startsWith('private:')) return path.join(env.privateDir, path.basename(stored.slice(8)));
  if (stored.startsWith('/uploads/')) return path.join(env.uploadDir, path.basename(stored));
  return null;
}

async function removeStored(...stored) {
  await Promise.all(
    stored
      .map(diskPath)
      .filter(Boolean)
      .map((p) => fs.promises.unlink(p).catch(() => {}))
  );
}

module.exports = { publicPath, privatePath, diskPath, removeStored };
