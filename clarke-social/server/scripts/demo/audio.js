// Generated demo music (WAV): short original synthesised loops — chords, an arpeggio and a soft beat.
// Nothing is sampled from existing recordings.
const RATE = 16000;
const PROGRESSIONS = [
  [0, 7, 9, 5], // I V vi IV
  [9, 5, 0, 7], // vi IV I V
  [0, 5, 7, 5], // I IV V IV
  [0, 9, 5, 7], // I vi IV V
];
const MAJOR = [0, 2, 4, 5, 7, 9, 11];

const freq = (semitone) => 220 * 2 ** (semitone / 12);

// seed -> { key, bpm, progression }; seconds of audio.
function track(seed, seconds = 24) {
  const key = (seed * 5) % 12;
  const bpm = 84 + ((seed * 11) % 40);
  const prog = PROGRESSIONS[seed % PROGRESSIONS.length];
  const beat = 60 / bpm;
  const samples = Math.floor(seconds * RATE);
  const data = Buffer.alloc(44 + samples * 2);

  for (let i = 0; i < samples; i++) {
    const t = i / RATE;
    const beatIndex = Math.floor(t / beat);
    const chordRoot = key + prog[Math.floor(beatIndex / 4) % prog.length];
    const third =
      chordRoot +
      (MAJOR.includes((chordRoot - key + 12) % 12) && [0, 5, 7].includes((chordRoot - key + 12) % 12) ? 4 : 3);
    // Pad: root, third and fifth, quiet and sustained.
    let v = [chordRoot, third, chordRoot + 7].reduce((s, n) => s + Math.sin(2 * Math.PI * freq(n) * t), 0) * 0.06;
    // Arpeggio: eighth notes cycling the chord an octave up, with a pluck envelope.
    const eighth = Math.floor(t / (beat / 2));
    const arpNote = [chordRoot, third, chordRoot + 7, third + 12][eighth % 4] + 12;
    const since = t - eighth * (beat / 2);
    v += Math.sin(2 * Math.PI * freq(arpNote) * t) * Math.exp(-since * 6) * 0.22;
    // Soft kick on each beat.
    const k = t - beatIndex * beat;
    v += Math.sin(2 * Math.PI * (55 + 60 * Math.exp(-k * 30)) * k) * Math.exp(-k * 12) * 0.3;
    // Fade in/out.
    v *= Math.min(1, t / 1.5, (seconds - t) / 2);
    data.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(v * 32767))), 44 + i * 2);
  }

  data.write('RIFF', 0);
  data.writeUInt32LE(36 + samples * 2, 4);
  data.write('WAVEfmt ', 8);
  data.writeUInt32LE(16, 16);
  data.writeUInt16LE(1, 20); // PCM
  data.writeUInt16LE(1, 22); // mono
  data.writeUInt32LE(RATE, 24);
  data.writeUInt32LE(RATE * 2, 28);
  data.writeUInt16LE(2, 32);
  data.writeUInt16LE(16, 34);
  data.write('data', 36);
  data.writeUInt32LE(samples * 2, 40);
  return data;
}

module.exports = { track };
