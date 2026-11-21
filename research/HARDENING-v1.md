# HARDENING REPORT — PerPlay (v1 · 21 พ.ย. 2026)

> ผลิตจาก: skill `evaluating-startup-ideas` + `idea-validation` + `market-research` + `pricing` + `startup-financial-modeling` + LifeOS TELOS context · ทุกตัวเลขแยก VERIFIED / INFERENCE ชัดชั้น

## VERDICT หนึ่งบรรทัด

ไอเดีย**ผ่านการ harden ได้ แต่ต้องเปลี่ยนลำดับ**: อย่าเพิ่งสร้าง fingerprint backend — เริ่มด้วย **Wizard-of-Oz pilot 1 ร้าน** เก็บเงินจริง 3 สัปดาห์ ก่อนลงโค้ดจริง (idea-validation: evidence before engineering)

---

## 1 · MARKET RESEARCH (market-research skill)

### VERIFIED (มีแหล่งอ้างอิง)
- **15,000+ licensed venues ทั่วไทย** (Bangkok 10,000+) — thisdaylive.com/2026/10/24 · xmap.ai นับ 32,689 nightlife locations รวมทุกประเภท
- **MCT blanket ~16,000 บาท/ปี** สำหรับร้านขนาด S (finetunes.app/th/music-licensing-cost-comparison-thailand) — นี่คือ **price anchor ที่เราต้องชนะในใจเจ้าร้าน**
- ซื้อ Spotify/Joox เปิดในร้าน**ยังผิด** — ต้องจ่าย MCT แยก (mct.in.th FAQ) = ตลาดละเมิดขนาดใหญ่ที่ต่อยอดได้
- **TouchTunes (สหรัฐ) พิสูจน์โมเดลแล้ว 25 ปี**: ติดตั้งฟรี ร้านได้ share จากทุกเพลงที่เปิด · mobile-first · $2/play — business.touchtunes.com → **โมเดล "ลูกค้าจ่าย + ร้านได้แบ่ง" ไม่ใช่การเดา คือธุรกิจที่มีอยู่จริงระดับพันล้าน** เราแค่ทำฉบับไทยที่จ่ายรายครั้งโปร่งใสบน chain
- **ACRCloud ~$5/1,000 requests ≈ 0.17฿/จับ** (autovj.club 2026) — ต้นทุนไม่ใช่เรื่อง

### INFERENCE (สมมติฐาน — ยังไม่พิสูจน์)
- 40 plays/คืน/ร้าน (ลดจาก 80 ที่เดาแรก) · 22 คืน/เดือน · ลูกค้ายอมจ่าย 30฿
- TAM ถ้าเวน 15k ร้าน: GMV ~0.4B฿/ปี · platform revenue ~80M฿/ปี (SOM เริ่มจริง: 50 ร้าน = ~3M฿ GMV/เดือน)

## 2 · UNIT ECONOMICS (startup-financial-modeling)

| ต่อ 1 play (30฿) | สัดส่วน | เงิน |
|---|---|---|
| ค่าย + ศิลปิน | 70% | 21฿ |
| ร้าน | 10% | 3฿ |
| **PerPlay (เรา)** | 20% | **6฿ gross → 5.73฿ สุทธิ (margin 96%)** |
| (ต้นทุน: fingerprint 0.17฿ + chain 0.10฿) | | |

- 10 ร้าน = 0.05M฿/เดือน · 50 ร้าน = 0.25M฿ · 200 ร้าน = 1.01M฿
- **ร้านมุมมอง:** รายได้ใหม่ ~2,640฿/เดือน เทียบ blanket 16,000฿/ปี (1,333฿/เดือน) → **ร้านกำไรแม้จ่าย blanket คู่กับเรา**

## 3 · PRICING (pricing skill)

- **Value metric ที่ถูก = จำนวน request** (ยิ่งร้านคึกยิ่งเราได้ — metric โตตาม value)
- Van Westendorp ลูกค้า: too cheap <10฿ · acceptable 20–50฿ · expensive >80฿ → **30฿ ตรง sweet spot** (= ราคาชา ๆ ไม่ใช่ราคาเบียร์)
- โครง 2 ชั้น: **ลูกค้าจ่ายรายเพลง** + **ร้านเลือกได้** (a) ฟรี + แบ่งให้ร้าน 10% หรือ (b) จ่าย blanket-pro รายเดือนที่ transparent เท่า blanket MCT — รับทั้งสองสาย ไม่บังคับ

## 4 · VALIDATION PLAN (idea-validation skill — เรียงจากถูกไปแพง)

| ขั้น | ทำอะไร | ต้นทุน | สัญญาณที่ยอมรับ |
|---|---|---|---|
| 0 · Listening | สัมภาษณ์เจ้าร้าน 5 ราย + วง 3 วง (ใช้ contacts วงไทยของคุณ) | 0฿ | เจ้าร้านบอกปัญหาค่าลิขสิทธิ์เองโดยไม่ต้องชวน |
| 1 · Wizard-of-Oz | **1 ร้านจริง: QR ขอเพลง → จ่ายจริง → วงเล่นเอง (ผม verify รายชื่อ manual ไม่มี AI)** | ~0฿ | **เงินเข้าจริง ≥100 ครั้ง/เดือน** = pull จริง ไม่ใช่ polite interest |
| 2 · Automated PoC | fingerprint + chain receipt (หลังขั้น 1 ผ่าน) | ~5k฿ | margin จริงตรงโมเดล |
| 3 · Grammy | เอาข้อมูลขั้น 1-2 ยิง meeting | 0฿ | LOI |

## 5 · REDTEAM — โจมตี 6 มุม (ผมโจมตีตัวเอง · delegation พังชั่วคราว)

| # | การโจมตี | Severity | Counter-move |
|---|---|---|---|
| 1 | **Double-dip MCT:** ร้านจ่าย blanket MCT อยู่แล้ว จ่ายซ้ำได้ไหม? ผิดกฎหมายไหม? | 🔴 สูง | เลี่ยงเถียง — เดินเป็น **add-on เพลงที่ไม่อยู่ใน blanket** (indie/catalog Grammy บางส่วน) + ชวน MCT เป็น partner (เขาได้ data + รายได้ใหม่ ไม่ใช่ศัตรู) |
| 2 | **ครั้งแรก Grammy ก็ไม่เกิด — ทำไมวันนี้จะเกิด?** และเขาอาจเอา spec ไปทำกับ big tech เอง | 🔴 สูง | ความต่าง = fingerprint ถูก + stablecoin มีจริง + เรามี PoC แล้ว 6 สัปดาห์ · ป้องกัน: ขอ LOI/exclusivity คุยระหว่างพัฒนา · ความเร็วคือ moat |
| 3 | **Cover band fingerprint แม่นยำ** — วงเล่นสำเนาต่างจากต้นฉบับ ผับเสียงดัง | 🟡 กลาง | MVP เล็งร้านสาย **DJ/backing-track** ก่อน (เสียงต้นฉบับ แม่นสุด) · วงสด = phase 2 ใช้วิธี "ลงทะเบียนเซ็ตลิสต์ล่วงหน้า" แทน fingerprint |
| 4 | **ปริมาณ 40 plays/คืน** อาจสูงเกินจริง — คืนวันธรรมดาอาจ 10 | 🟡 กลาง | conservative case 10 ร้านยังมี margin 96% — โมเดลไม่พัง แต่ TAM ต้องลด · kill-criteria: pilot 1 ร้าน <30 plays/เดือน = ปรับโมเดล |
| 5 | **สเตเบิลผิดกฎ** — จ่ายค่าเพลงด้วย stablecoin ต้องขออะไร | 🟡 กลาง | **พร้อมเพย์มาก่อนเสมอ** · stablecoin = receipt/settlement ระหว่าง B2B (ร้าน↔แพลตฟอร์ม↔ค่าย) เท่านั้น ไม่ใช่รายวันลูกค้า — เข้า sandbox ทีหลัง |
| 6 | **Founder risk:** นักเรียน Warning 2 + finals + ทีม 1 คน + 1 AI | 🟢 ต่ำ | Wizard-of-Oz ใช้มือเปล่า ไม่ใช้ dev time · PoC ผมสร้างให้ · timebox founder 5 ชม./สัปดาห์จนถึงหลัง finals |

### Untested assumptions — เรียงตามอันตราย
1. ลูกค้าจ่ายจริง (ยังไม่มีหลักฐานเงินสักบาท) → ขั้น 1 ตอบ
2. เจ้าร้านต้องการรายได้ share มากกว่ากลัวยุ่งยาก → ขั้น 0 ตอบ
3. Grammy ยังจำและยังอยาก (LOI จะยืนยัน)

---

## ผลลัพธ์: pitch v2 อัปเดตด้วยตัวเลข verified แล้ว (ดู PITCH-v2.md)

## คำถามที่ถ้าคำตอบเปลี่ยน = ไอเดียเปลี่ยน
1. MCT จะทำยังไงถ้าเราเปิดตัวโดยไม่ผ่านเขา? (ขั้น 0 ถามเจ้าร้านเจอจริง)
2. Grammy ยอมให้เราใช้ catalog แบบ non-exclusive ตอน PoC ไหม?
3. ลูกค้าจ่าย 30฿ ซ้ำเดือนละกี่ครั้ง? (ขั้น 1 วัดจริง)
