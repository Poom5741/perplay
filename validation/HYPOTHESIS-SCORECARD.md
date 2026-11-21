# Founding Hypothesis Scorecard (Foundation Sprint framework) · 2026-11-21T07:30:00Z

| องค์ประกอบ | คำตอบ | สถานะ |
|---|---|---|
| **Customer** | ร้านกลางคืน/ผับ + ค่ายเพลง (GMM Grammy/RS) — 2 ฝั่งในธุรกรรมเดียว | ฝั่งค่าย = warm (Grammy เคยขอเอง) · ฝั่งร้าน = ยังไม่ยืนยัน |
| **Problem** | ค่าลิขสิทธิ์เพลงเปิดสดเก็บไม่ได้รายครั้ง + royalty กล่องดำ | ค่ายยืนยัน (อยากได้รายได้เพิ่ม) · ร้านยังไม่ยืนยัน |
| **Approach** | QR ขอเพลงรายครั้ง → fingerprint/setlist verify → receipt on-chain → split stablecoin | ต้องพิสูจน์ PoC |
| **Competitors** | MCT blanket เดิม · TouchTunes (สหรัฐ, พิสูจน์แล้ว) · ไม่มี per-play+chain ในไทย | desk-verified |
| **Differentiator** | โปร่งใสรายครั้งบน chain + catalog ใหญ่สุดตั้งแต่วันแรก (Grammy relationship) | ยังไม่ทดสอบ |

## Four Product Risks (Cagan)
| Risk | คำถาม | สถานะ | วิธีตอบ |
|---|---|---|---|
| Value | ลูกค้าจะจ่ายขอเพลงจริงไหม | ❌ ยังไม่พิสูจน์ | Wizard-of-Oz เก็บเงินจริง (เลื่อนหลัง PoC ตามคำสั่ง Poom) |
| Usability | ขอเพลง ≤30 วิ ได้จริงไหม | PoC ตอบ | PoC |
| Feasibility | fingerprint/chain ระบบจริงได้ไหม | PoC ตอบ | PoC |
| Viability | Grammy แบ่งเงินแบบนี้ได้ไหม · sandbox ผ่านไหม | 🟡 ครึ่ง | LOI + sandbox application |

## Riskiest assumptions (เรียงอันตรายสุดก่อน)
1. ลูกค้าจ่าย 30฿/เพลง ซ้ำเป็นจำนวนมาก (ยังไม่พิสูจน์)
2. Grammy ยอมให้ใช้ catalog กับ third-party platform (จากคำตอบพ่อ: มีโอกาสถ้ามี PoC)
3. ระบบ verify วงสดแม่นพอ (ตอบแล้ว 87% — จึงใช้ setlist mode เป็นหลัก)
4. ร้านยินดีเปลี่ยนจาก blanket → per-play hybrid
