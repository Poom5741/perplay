// Song catalog — 100 MOCK songs, mixed Thai + English (fictional titles/artists, clearly demo data).
// English songs keep international judges oriented; Thai songs keep the home-market story.
// Split config per spec: label 70 / venue 10 / platform 20 (% of play price)
import crypto from 'node:crypto';
import { readFileSync, existsSync, mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), 'data');
const FP_FILE = path.join(DATA_DIR, 'fingerprints.json');

const PRICES = [25, 30, 35, 40, 50];
const LABELS = ['GMM-Mock A', 'GMM-Mock B', 'GMM-Mock C', 'Intl-Mock'];
const TITLE_A = ['รอยไหม้', 'ฝนด้านเทอมสุดท้าย', 'ดาวตกหล่นกลางกรุง', 'เพลงที่ยังไม่ได้ร้อง', 'คืนที่เสียงหาย', 'เงาในลิฟท์', 'หอมกลิ่นฝนอำเภอเก่า', 'นาฬิกาทรายอันเดิม', 'รถไฟสายหลับใหล', 'เท็ปเก่าในตู้เสื้อ'];
const TITLE_B = ['ของดาวรอสาย', 'ตอนที่เธอหันกลับ', 'สายลมคนเบาๆ', 'ปลายถนนไม่มีเพลง', 'วงเล็บกลางคืน', 'หน้าต่างชั้นเก้า', 'จดหมายที่ไม่เคยส่ง', 'เที่ยวสุดท้ายของบ่าย', 'เส้นขนานหัวใจ', 'แสงนีออนตาเปียก'];
const ARTIST_A = ['วง ม้วนเพลง', 'แพรวา ใจดี', 'โฟร์ท เสียงดี', 'ดีเจ เอ๋ย', 'ธันย์ ขับกล่อม', 'มิ้นต์ อคูสติก', 'ต้นข้าว บร๊ะเดอร์', 'น้ำหวาน ซินธ์', 'กลุ่มเสียงรอ', 'โจทย์ แอนด์ เดอะเฟด'];
const ARTIST_B = ['พลอย พาราด็อกซ์', 'วง เทปซ้ำ', 'เบนซ์ มิดไนท์', 'อรุณ สามยาม', 'วง ห้องซ้อม', 'ฟ้าใส โฟล์ค', 'ราตรี แอมพลิไฟเออร์', 'หมาก มะเขือเทศ', 'วง คลื่นซ้อน', 'แม่มด นครินท์'];
const TITLE_EN_A = ['Neon Rain on Fifth Street', 'Last Train to Anywhere', 'Paper Planes at Midnight', 'The Song We Never Sang', 'Static in the Hollow', 'Elevator Ghost', 'Old Town Rain', 'Hourglass Heart', 'Sleeping Car Blues', 'Mixtape in the Jean Jacket'];
const TITLE_EN_B = ['Waiting on a Star', 'When You Turn Around', 'Soft Wind, Loud Night', 'Where the Road Runs Out', 'Held Breath at Midnight', 'Ninth-Floor Window', 'The Letter Never Sent', 'Last Swim of Summer', 'Parallel Hearts', 'Neon Eyes Wet'];
const ARTIST_EN_A = ['The Vinyl Club', 'Praewa & the Paradox', 'Northbound Sound', 'DJ Aey', 'Thanys Lullaby', 'Mint Acoustic', 'Rice Field Brothers', 'Namwan Synth', 'The Echo Circle', 'Prompt & The Fade'];
const ARTIST_EN_B = ['Ploy Paradox', 'Tape Rewind', 'Benz Midnight', 'Arun 3AM', 'The Rehearsal Room', 'Clear Sky Folk', 'Ratri Amplifier', 'Maak Tomato', 'Overlap Waves', 'Witch of Nakhon'];

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildCatalog(n = 100) {
  const rand = mulberry32(20261121);
  const songs = [];
  for (let i = 1; i <= n; i++) {
    const english = i % 2 === 0; // deterministic 50/50 Thai/English mix
    const [tA, tB, aA, aB] = english ? [TITLE_EN_A, TITLE_EN_B, ARTIST_EN_A, ARTIST_EN_B] : [TITLE_A, TITLE_B, ARTIST_A, ARTIST_B];
    const title = `${tA[Math.floor(rand() * tA.length)]} ${tB[Math.floor(rand() * tB.length)]}${i % 7 === 0 ? ' (Acoustic)' : ''}`;
    const artist = rand() > 0.5 ? aA[Math.floor(rand() * aA.length)] : aB[Math.floor(rand() * aB.length)];
    songs.push({
      id: `S${String(i).padStart(3, '0')}`,
      title,
      artist,
      label: english ? 'Intl-Mock' : LABELS[Math.floor(rand() * 3)],
      priceTHB: PRICES[Math.floor(rand() * PRICES.length)],
      splits: { label: 0.70, venue: 0.10, platform: 0.20 }, // per POC-SPEC
      mock: true,
    });
  }
  return songs;
}

// ---- Mock fingerprint registry (VERIFIED pipeline shape, SIMULATED fingerprint source) ----
// fingerprint = sha256 of the deterministic mock waveform file (scripts/make-audio.mjs output)
// Real deployment: ACRCloud free trial (0.17฿/จับ) — same match/verify interface.
export function ensureFingerprints(audioDir) {
  mkdirSync(DATA_DIR, { recursive: true });
  if (existsSync(FP_FILE)) return JSON.parse(readFileSync(FP_FILE, 'utf8'));
  const fps = {};
  if (audioDir && existsSync(audioDir)) {
    for (const f of readdirSync(audioDir)) {
      if (!f.endsWith('.wav')) continue;
      const id = f.replace('.wav', '');
      fps[id] = sha256File(path.join(audioDir, f));
    }
    writeFileSync(FP_FILE, JSON.stringify(fps, null, 2));
  }
  return fps;
}

export function sha256File(file) {
  return crypto.createHash('sha256').update(readFileSync(file)).digest('hex');
}

export function sha256Buf(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}
