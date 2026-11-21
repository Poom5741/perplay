// Generate mock WAV "recordings" per song — distinct melodic signature per track.
// These are the testbed for the audio-scan verify path (offline scanning first,
// per POC-SPEC risk #1: separate model problem from mic/line problem).
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const OUT = path.join(process.cwd(), 'audio');
mkdirSync(OUT, { recursive: true });

// deterministic pseudo-random from seed
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
function melody(seed, n) {
  const r = rng(seed);
  const scale = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25];
  return Array.from({ length: n }, () => scale[Math.floor(r() * scale.length)]);
}

const SR = 8000; // 8kHz mono — tiny files, enough for hash identity
const DUR = 3;   // seconds

// expects catalog order identical to buildCatalog (seed 20261121)
const { buildCatalog } = await import('../lib/catalog.mjs');
const songs = buildCatalog(100);

for (const s of songs) {
  const seed = parseInt(s.id.slice(1), 10) + 20261121;
  const notes = melody(seed, DUR * 4); // 4 notes/sec
  const nSamples = SR * DUR;
  const pcm = Buffer.alloc(nSamples * 2);
  for (let i = 0; i < nSamples; i++) {
    const t = i / SR;
    const noteIdx = Math.min(notes.length - 1, Math.floor(t * 4));
    const f = notes[noteIdx];
    const amp = 0.4 * Math.sin(2 * Math.PI * 4 * t) + 0.6; // slight envelope
    const v = Math.round(amp * 12000 * Math.sin(2 * Math.PI * f * t));
    pcm.writeInt16LE(Math.max(-32768, Math.min(32767, v)), i * 2);
  }
  const header = Buffer.alloc(44);
  header.write('RIFF', 0); header.writeUInt32LE(36 + pcm.length, 4); header.write('WAVE', 8);
  header.write('fmt ', 12); header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22); header.writeUInt32LE(SR, 24); header.writeUInt32LE(SR * 2, 28);
  header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34);
  header.write('data', 36); header.writeUInt32LE(pcm.length, 40);
  writeFileSync(path.join(OUT, `${s.id}.wav`), Buffer.concat([header, pcm]));
}
console.log(`สร้าง ${songs.length} ไฟล์ mock WAV ใน audio/ (3s, 8kHz mono)`);
