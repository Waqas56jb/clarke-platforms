// Shared helpers for the demo seed: deterministic randomness, file storage and time offsets.
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const env = require('../../src/config/env');
const { publicPath, privatePath } = require('../../src/utils/storage');

const MEDIA_DIR = path.join(__dirname, 'media');
const VIDEO_CLIPS = [
  'sunset',
  'rain',
  'fireworks',
  'city',
  'confetti',
  'aurora',
  'stars',
  'shore',
  'bubbles',
  'kaleido',
];

// Same seed -> same choices on every run, so re-running never reshuffles the data.
function rng(seed) {
  let s = (seed * 2654435761) % 2147483647 || 1;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

const pick = (r, list) => list[Math.floor(r() * list.length)];

function shuffle(r, list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const HOUR = 3600 * 1000;
const hoursAgo = (h) => new Date(Date.now() - h * HOUR);
const daysAgo = (d) => hoursAgo(d * 24);

// Writes a generated file into the same upload folders the API uses and returns the
// { stored, type } object the services expect from an upload.
function store(buffer, ext, type, { private: isPrivate = false } = {}) {
  const name = `demo-${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${ext}`;
  fs.writeFileSync(path.join(isPrivate ? env.privateDir : env.uploadDir, name), buffer);
  return { stored: isPrivate ? privatePath(name) : publicPath(name), type };
}

const clip = (index) => fs.readFileSync(path.join(MEDIA_DIR, `${VIDEO_CLIPS[index % VIDEO_CLIPS.length]}.mp4`));

const log = (...args) => console.info('[demo]', ...args);

module.exports = { rng, pick, shuffle, hoursAgo, daysAgo, store, clip, log, VIDEO_CLIPS };
