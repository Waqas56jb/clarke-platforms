// Generated demo images (PNG): procedural scenes and abstract avatars/posters. No photos of people,
// no third-party artwork — every pixel is computed here, so the output is free to use.
const zlib = require('zlib');

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

// Encodes an RGB pixel function as a PNG buffer.
function png(width, height, pixel) {
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) {
    const row = y * (width * 3 + 1);
    for (let x = 0; x < width; x++) {
      const [r, g, b] = pixel(x, y);
      const i = row + 1 + x * 3;
      raw[i] = clamp(r);
      raw[i + 1] = clamp(g);
      raw[i + 2] = clamp(b);
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header.set([8, 2, 0, 0, 0], 8);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

// Deterministic pseudo-random numbers so a given seed always draws the same picture.
function rng(seed) {
  let s = seed % 2147483647 || 1;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

const PALETTES = [
  ['#ff7e5f', '#feb47b', '#1e3c72'],
  ['#43cea2', '#185a9d', '#f8ffae'],
  ['#ee9ca7', '#ffdde1', '#5f2c82'],
  ['#2193b0', '#6dd5ed', '#f7971e'],
  ['#c94b4b', '#4b134f', '#f9d423'],
  ['#56ab2f', '#a8e063', '#134e5e'],
  ['#f7971e', '#ffd200', '#0f2027'],
  ['#8e2de2', '#4a00e0', '#ff6a88'],
].map((p) => p.map(hex));

const SCENES = {
  // Sun over layered sea.
  sunset(w, h, r, pal) {
    const sun = [w * (0.3 + r() * 0.4), h * (0.35 + r() * 0.1)];
    const radius = h * (0.08 + r() * 0.05);
    const phase = r() * 10;
    return (x, y) => {
      const horizon = h * 0.58;
      if (y < horizon) {
        const d = Math.hypot(x - sun[0], y - sun[1]);
        if (d < radius) return [255, 244, 200];
        const glow = Math.max(0, 1 - d / (radius * 4)) * 0.5;
        return mix(mix(pal[0], pal[1], y / horizon), [255, 240, 200], glow);
      }
      const t = (y - horizon) / (h - horizon);
      const wave = Math.sin(x / 23 + y / 3 + phase) * 0.06;
      const shine = Math.abs(x - sun[0]) < radius * (1 - t) && Math.sin(y * 0.9) > 0.3 ? 0.35 : 0;
      return mix(mix(pal[1], pal[2], Math.min(1, t * 1.4 + wave)), [255, 230, 190], shine);
    };
  },
  // Layered mountain ridges.
  mountains(w, h, r, pal) {
    const ridges = Array.from({ length: 4 }, (_, i) => ({
      base: h * (0.42 + i * 0.13),
      f: 60 + r() * 80,
      a: 30 + r() * 50,
      p: r() * 9,
    }));
    return (x, y) => {
      for (let i = ridges.length - 1; i >= 0; i--) {
        const g = ridges[i];
        const top = g.base + Math.sin(x / g.f + g.p) * g.a + Math.sin(x / (g.f / 3) + g.p) * g.a * 0.25;
        if (y > top) return mix(pal[2], pal[0], (i / ridges.length) * 0.6);
      }
      return mix(pal[1], [255, 255, 255], (1 - y / h) * 0.5);
    };
  },
  // Beach: sky, turquoise sea, wet sand, dry sand.
  beach(w, h, r) {
    const shore = h * (0.62 + r() * 0.06);
    const phase = r() * 6;
    return (x, y) => {
      const edge = shore + Math.sin(x / 40 + phase) * 9;
      if (y < h * 0.4) return mix([135, 206, 250], [200, 236, 255], y / (h * 0.4));
      if (y < edge - 6) return mix([0, 150, 170], [64, 224, 208], (y - h * 0.4) / (edge - h * 0.4));
      if (y < edge) return [245, 250, 250];
      return mix([222, 196, 150], [245, 222, 179], (y - edge) / (h - edge));
    };
  },
  // City skyline at dusk with lit windows.
  skyline(w, h, r, pal) {
    const blocks = [];
    for (let x = 0; x < w;) {
      const bw = 30 + r() * 60;
      blocks.push({ x, w: bw, top: h * (0.35 + r() * 0.4) });
      x += bw;
    }
    return (x, y) => {
      const b = blocks.find((k) => x >= k.x && x < k.x + k.w);
      if (b && y > b.top) {
        const lit = (Math.floor((x - b.x) / 9) + Math.floor(y / 13) * 7 + Math.floor(b.x)) % 5 === 0;
        return (x - b.x) % 9 > 3 && y % 13 > 5 && lit ? [255, 214, 120] : [24, 26, 52];
      }
      return mix(pal[0], [20, 24, 60], y / h);
    };
  },
  // Soft bokeh circles.
  bokeh(w, h, r, pal) {
    const dots = Array.from({ length: 26 }, () => ({
      x: r() * w,
      y: r() * h,
      s: 20 + r() * 70,
      c: pal[Math.floor(r() * 3)],
    }));
    return (x, y) => {
      let col = mix([16, 18, 34], pal[2], (y / h) * 0.4);
      for (const d of dots) {
        const k = 1 - Math.hypot(x - d.x, y - d.y) / d.s;
        if (k > 0) col = mix(col, d.c, Math.min(0.55, k * 0.9));
      }
      return col;
    };
  },
  // Abstract flowing waves of colour.
  waves(w, h, r, pal) {
    const p = r() * 10;
    return (x, y) => {
      const v = Math.sin(x / 70 + p) + Math.sin(y / 50 + p * 2) + Math.sin((x + y) / 90);
      const t = (v + 3) / 6;
      return t < 0.5 ? mix(pal[0], pal[1], t * 2) : mix(pal[1], pal[2], (t - 0.5) * 2);
    };
  },
};

const SCENE_NAMES = Object.keys(SCENES);

function scene(seed, width = 800, height = 600, name) {
  const r = rng(seed * 7919 + 13);
  const pal = PALETTES[seed % PALETTES.length];
  const kind = name || SCENE_NAMES[seed % SCENE_NAMES.length];
  return png(width, height, SCENES[kind](width, height, r, pal));
}

// Abstract avatar: gradient disc pattern, no faces.
function avatar(seed) {
  const r = rng(seed * 104729 + 7);
  const pal = PALETTES[seed % PALETTES.length];
  const cx = 128 + (r() - 0.5) * 80;
  const cy = 128 + (r() - 0.5) * 80;
  const band = 18 + r() * 20;
  const style = seed % 3;
  return png(256, 256, (x, y) => {
    const base = mix(pal[0], pal[1], (x + y) / 512);
    if (style === 0) return Math.floor(Math.hypot(x - cx, y - cy) / band) % 2 ? mix(base, pal[2], 0.35) : base;
    if (style === 1) return Math.floor((x * 0.7 + y) / band) % 2 ? mix(base, pal[2], 0.3) : base;
    const blob = Math.max(0, 1 - Math.hypot(x - cx, y - cy) / 110);
    return mix(base, pal[2], blob * 0.8);
  });
}

// Film poster artwork (2:3), title is shown by the site, not drawn here.
function poster(seed) {
  return scene(seed + 50, 400, 600, ['mountains', 'skyline', 'bokeh', 'waves', 'sunset'][seed % 5]);
}

module.exports = { scene, avatar, poster, SCENE_NAMES };
