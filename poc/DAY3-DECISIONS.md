# DAY 3 (พุธ) — DECIDE: spec สั้นก่อน build

## เลือก UX: Option A (QR บนโต๊ะ → มือถือลูกค้า)

## Catalog data schema
```json
{ "id":"S001", "title":"…", "artist":"…", "label":"GMM-Mock A",
  "priceTHB":30, "splits":{"label":0.70,"venue":0.10,"platform":0.20}, "mock":true }
```
- 100 เพลง, 3 ค่าย mock, ราคา 25/30/35/40/50฿ (ค่ากลางผับจริงตาม brief: 20–50฿)

## Split config (ล็อค): 70/10/20 — ตาม POC-SPEC (ค่าย 70 / ร้าน 10 / แพลตฟอร์ม 20)

## ตัดสินเทคนิคที่ต้องล็อคก่อน build
1. **Verify วงสด = เซ็ตลิสต์ล่วงหน้า** (ไม่ใช้ fingerprint เสียงสด — arXiv 2501.08129 แม่น ~87.4% top-1 ต่ำสำหรับการเรียกเก็บเงิน) · Verify DJ = audio-scan (PoC: sha256 mock fingerprint; prod: ACRCloud)
2. **Receipt = data-only tx บน Base Sepolia** — hash ของ canonical play event (ไม่ deploy contract ใน PoC — พอสำหรับ "tx ที่กดดูได้", contract/events เป็น phase 2)
3. **Payment = PromptPay payload จริง + simulate การรับเงิน** — payload ผ่านมาตรฐาน EMVCo (CRC16 ตรวจอัตโนมัติทุกครั้งที่ generate)
4. **สถานะ play**: qr_pending → paid → verified → anchored (async) · confirm-paid idempotent (กันกดซ้ำตอนเดโม)
5. **เกณฑ์ผ่าน**: e2e ≤30 วิ วัดจริงทุก play (server เก็บ timings + ledger rollup)

## ความเสี่ยงค้าง (รับไว้ ไม่แก้ใน PoC)
- line-in จริงในผับ noise สูง → ทดสอบด้วยไฟล์ก่อน (แยกปัญหาโมเดลออกจากไมค์) — ยังไม่ได้ทดสอบสนาม ตาม desk-based 100%
