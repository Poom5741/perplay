# POC-SPEC — PerPlay (PoC สำหรับเดโม Grammy · v1 · 21 พ.ย. 2026)

> โดยเนื้อหา: lean-startup + design-sprint + msw-planning frameworks · desk-based 100% (ไม่มีการออกสนาม) · ปลายทาง = PoC ไปให้ Grammy ดู

## สมมติฐานที่ PoC ต้องพิสูจน์ (technical only — ไม่ใช่ market validation)

1. ระบบ end-to-end จาก "ลูกค้าขอเพลง" ถึง "receipt on-chain + split ledger" ทำได้ **≤30 วินาที** ต่อ 1 play
2. ต้นทุนต่อ play < 1 บาท (fingerprint + chain fee รวม)
3. เดโมต่อคนไม่ใช่ tech ได้เข้าใจภายใน 5 นาที

## Architecture (PoC scope — จงใจเล็ก)

```
[หน้า 1] Song Catalog (mock 100 เพลง Grammy-style: ชื่อ/ศิลปิน/ค่าย/split %)
    ↓ ลูกค้าเลือกเพลง
[หน้า 2] QR PromptPay (generate payload จริง) + ปุ่ม "ยืนยันชำระแล้ว" (PoC simulate)
    ↓
[หน้า 3] จอฉายหลังวง: "กำลังเล่น: <เพลง> — ได้รับอนุญาต ✅ รายการ #123"
    ↓
[Verify] 2 โหมด:
  a) DJ/backing-track venue → ACRCloud (free trial) จับจาก line-in จริง
  b) วงสด cover → Setlist mode: วงลงทะเบียนเซ็ตลิสต์ล่วงหน้า (fingerprint วงสดแม่นแค่ 87% — arXiv 2501.08129 → ไม่พึ่ง)
    ↓
[Receipt] hash(play_event) → anchor บน Base testnet → ได้ tx link โชว์ได้
[Split] ledger บันทึก 70/10/20 อัตโนมัติ + dashboard 3 ฝั่ง (ร้าน/ศิลปิน/ค่าย)
```

**ตัดออกจาก PoC จงใจ:** stablecoin จริงในธุรกรรมลูกค้า (ใช้ prompt pay + simulate · อ้างอิงโครงสร้าง WORPT: convert-at-payment ผ่าน sandbox ได้ — ไปเป็น phase 2), สมาชิก/สมัคร, mobile app

## Design Sprint 5 วัน (รูปแบบ design-sprint · desk only)

| วัน | ทำอะไร | ผลลัพธ์ |
|---|---|---|
| จันทร์ | Map: วาด journey ลูกค้า-ร้าน-ค่าย + เลือก target moment ("จบ 30 วินาที") | flow diagram |
| อังคาร | Sketch: UX ขอเพลง 1 แตะ (3 ทางเลือก) | 3 แบบ |
| พุธ | Decide: เลือก 1 + ร่าง catalog data + split config | spec สั้น |
| พฤหัส | **Build**: หน้าเว็บ + QR + receipt บน Base testnet (Hermes สร้าง) | PoC รันได้ |
| ศุกร์ | **Test กับพ่อ** — พ่อคือ proxy ของ Grammy (รู้โจทย์จริงจาก Grammy เอง) | feedback + คำถามจริงจากฝั่งค่าย |

> เคล็ด: "ทดสอบกับพ่อ" = desk validation ที่ใกล้ Grammy ที่สุดในโลกโดยไม่ต้องออกสนาม — และเป็นการเปิดทาง LOI ธรรมชาติ

## ผลลัพธ์ที่ต้องมี (artifact-first)

- URL เดโม (GitHub Pages/CF Pages) เปิดจากมือถือได้
- ลิงก์ tx จริงบน Base testnet ที่กดดูได้
- Dashboard split แสดงตัวเลขสะสม
- Script เดโม 5 นาที (อ่านเป็นลำดับ)

# FEASIBILITY — desk findings (แยก VERIFIED/INFERENCE)

## VERIFIED
- **Live-version fingerprint ~87.4% top-1** ด้วย deep sequence learning (arxiv.org/html/2501.08129, 2025) → ใช้เป็นรอง · **Setlist mode เป็นหลักสำหรับวงสด** (ตัดปัญหา cover identification ทั้งสายวิจัย)
- **ACRCloud ~$5/1,000** = ~0.17฿/จับ (autovj.club) · free trial 14 วันมี API เต็ม (acrcloud.com)
- **WORPT รันจริงใน SEC TouristDigiPay sandbox (ต.ค. 2026):** แปลง USDT/USDC → บาทตอนจ่าย ร้านไม่เห็น crypto — โครงสร้างเดียวกับที่เราจะใช้ (blockhead.co/2026/10/29 · coingabbar.com)
- **BOT มี regulatory sandbox "Programmable Payment"** เปิดชัด (bot.or.th) → เส้นทาง application มีอยู่จริง
- TouchTunes: ร้านได้ share + ติดตั้งฟรี — ธุรกิจจริง 25 ปี (business.touchtunes.com)

## INFERENCE
- ต้นทุน chain fee บน Base testnet = 0 (testnet) · mainnet ~<$0.01/receipt
- Grammy จะคุยจริงถ้าเห็น PoC + ตัวเลข pilot (จากคำตอบพ่อ)

## ความเสี่ยงเทคนิคอันดับ 1
- รับเสียงจริงจาก line-in ในผับ (noise floor สูง) → PoC ทดสอบด้วยไฟล์เสียงก่อน (offline scanning) เพื่อแยกปัญหา "โมเดล" ออกจากปัญหา "ไมค์/สาย"
