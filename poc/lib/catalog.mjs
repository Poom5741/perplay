// Song catalog — 100 MOCK Grammy-style songs (fictional titles/artists, clearly demo data)
// Split config per spec: ค่าย 70 / ร้าน 10 / แพลตฟอร์ม 20 (% ของราคาเพลง)
import crypto from 'node:crypto';
import { readFileSync, existsSync, mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), 'data');
const FP_FILE = path.join(DATA_DIR, 'fingerprints.json');

const PRICES = [25, 30, 35, 40, 50];
const LABELS = ['GMM-Mock A', 'GMM-Mock B', 'GMM-Mock C'];
const TITLE_A = ['รอยไหม้', 'ฝนด้านเทอมสุดท้าย', 'ดาวตกหล่นกลางกรุง', 'เพลงที่ยังไม่ได้ร้อง', 'คืนที่เสียงหาย', 'เงาในลิฟท์', 'หอมกลิ่นฝนอำเภอเก่า', 'นาฬิกาทรายอันเดิม', 'รถไฟสายหลับใหล', 'เท็ปเก่าในตู้เสื้อ'];
const TITLE_B = ['ของดาวรอสาย', 'ตอนที่เธอหันกลับ', 'สายลมคนเบาๆ', 'ปลายถนนไม่มีเพลง', 'วงเล็บกลางคืน', 'หน้าต่างชั้นเก้า', 'จดหมายที่ไม่เคยส่ง', 'เที่ยวสุดท้ายของบ่าย', 'เส้นขนานหัวใจ', 'แสงนีออนตาเปียก'];
const ARTIST_A = ['วง ม้วนเพลง', 'แพรวา ใจดี', 'โฟร์ท เสียงดี', 'ดีเจ เอ๋ย', 'ธันย์ ขับกล่อม', 'มิ้นต์ อคูสติก', 'ต้นข้าว บร๊ะเดอร์', 'น้ำหวาน ซินธ์', 'กลุ่มเสียงรอ', 'โจทย์ แอนด์ เดอะเฟด'];
const ARTIST_B = ['พลอย พาราด็อกซ์', 'วง เทปซ้ำ', 'เบนซ์ มิดไนท์', 'อรุณ สามยาม', 'วง ห้องซ้อม', 'ฟ้าใส โฟล์ค', 'ราตรี แอมพลิไฟเออร์', 'หมาก มะเขือเทศ', 'วง คลื่นซ้อน', 'แม่มด นครินทร์'];

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
    const title = `${TITLE_A[Math.floor(rand() * TITLE_A.length)]} ${TITLE_B[Math.floor(rand() * TITLE_B.length)]}${i % 7 === 0 ? ' (Acoustic)' : ''}`;
    const artist = rand() > 0.5 ? ARTIST_A[Math.floor(rand() * ARTIST_A.length)] : ARTIST_B[Math.floor(rand() * ARTIST_B.length)];
    songs.push({
      id: `S${String(i).padStart(3, '0')}`,
      title,
      artist,
      label: LABELS[Math.floor(rand() * LABELS.length)],
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
