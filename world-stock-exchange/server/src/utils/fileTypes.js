// Detects a file's real type from its first bytes, so uploads are checked by content and not only by
// the name or the type the browser claims.
const fs = require('fs');

const startsWith = (buf, bytes, offset = 0) => bytes.every((b, i) => buf[offset + i] === b);
const ascii = (buf, start, end) => buf.subarray(start, end).toString('latin1');

function detect(buf) {
  if (startsWith(buf, [0xff, 0xd8, 0xff])) return 'image/jpeg';
  if (startsWith(buf, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image/png';
  if (ascii(buf, 0, 6) === 'GIF87a' || ascii(buf, 0, 6) === 'GIF89a') return 'image/gif';
  if (ascii(buf, 0, 4) === 'RIFF' && ascii(buf, 8, 12) === 'WEBP') return 'image/webp';
  if (ascii(buf, 0, 4) === 'RIFF' && ascii(buf, 8, 12) === 'WAVE') return 'audio/wav';
  if (startsWith(buf, [0x1a, 0x45, 0xdf, 0xa3])) return 'video/webm';
  if (ascii(buf, 4, 8) === 'ftyp') {
    const brand = ascii(buf, 8, 12);
    if (brand === 'qt  ') return 'video/quicktime';
    if (brand.startsWith('M4A')) return 'audio/mp4';
    return 'video/mp4';
  }
  if (ascii(buf, 0, 3) === 'ID3') return 'audio/mpeg';
  // MPEG audio frame sync: layer bits 00 mean an AAC (ADTS) stream, anything else is MP3.
  if (buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0) return (buf[1] & 0x06) === 0 ? 'audio/aac' : 'audio/mpeg';
  if (ascii(buf, 0, 4) === 'fLaC') return 'audio/flac';
  if (ascii(buf, 0, 4) === 'OggS') return 'audio/ogg';
  if (ascii(buf, 0, 5) === '%PDF-') return 'application/pdf';
  if (startsWith(buf, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])) return 'application/msword';
  if (startsWith(buf, [0x50, 0x4b, 0x03, 0x04])) return 'application/zip';
  return null;
}

async function sniffFile(filePath) {
  const handle = await fs.promises.open(filePath, 'r');
  try {
    const buf = Buffer.alloc(64);
    await handle.read(buf, 0, 64, 0);
    return detect(buf);
  } finally {
    await handle.close();
  }
}

module.exports = { sniffFile };
