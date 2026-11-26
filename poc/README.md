# PlayRight PoC — build notes

> ตาม `~/workspace/tedfund-lab/POC-SPEC.md` · desk-based 100% · เดโม URL: **https://playright.169-58-137-159.sslip.io**

## สถานะ (21 พ.ย. 2026)

**รันได้ end-to-end จริง · e2e test 19/19 PASS** (`npm run e2e`)

| สมมติฐาน (POC-SPEC) | ผลวัดจริง |
|---|---|
| 1. end-to-end ≤30 วิ/1 play | ✅ **0.6–3.5 วิ** รวม tx จริงบน testnet — ปัจจุบัน anchor บน BSC Testnet (chain 97) (setlist 0.7s, fingerprint 0.6–1.1s) |
| 2. ต้นทุน/play < 1฿ | ✅ fee จริงต่อ receipt ~0.0000006 ETH/tx (วัดจาก balance ก่อน-หลัง) ≈ ไม่ถึง 1 สตางค์ · fingerprint PoC = 0฿ (prod: ACRCloud ~0.17฿/จับ) |
| 3. non-tech เข้าใจ ≤5 นาที | ⏳ วัดวันศุกร์ตอนทดสอบกับพ่อ — มี DEMO-SCRIPT.md เตรียมแล้ว |

## URL เดโม (เปิดจากมือถือ)

- **https://playright.169-58-137-159.sslip.io** — Caddy reverse proxy → systemd unit `playright-poc.service` (port 3000) บน VPS นี้
- ชื่อโดเมนใช้ sslip.io (wildcard DNS สาธารณะ) เพื่อไม่ต้องแตะ DNS ของ arisium.xyz — เปลี่ยนเป็น subdomain จริงทีหลังได้โดยเพิ่ม CNAME + แก้ Caddyfile บรรทัดเดียว
- tx links: testnet.bscscan.com (ถ้าโดน bot-check ลองเปิดผ่านเบราว์เซอร์อื่น หรือใช้ blockscout สำรอง)

## Flow ที่รันจริงแล้ว

1. **Catalog** 100 เพลง mock (GMM-Mock A/B/C, ชื่อเพลง/ศิลปินสมมุติทั้งหมด, split 70/10/20 ทุกเพลง)
2. **QR PromptPay จริง** — EMVCo dynamic payload + CRC16-CCITT (สแกนด้วยแอปธนาคารได้ แต่ PoC simulate การรับเงินด้วยปุ่ม "ยืนยันชำระแล้ว")
3. **จอฉายหลังวง** — "กำลังเล่น: X — ได้รับอนุญาต ✅ รายการ #N" + receipt tx link
4. **Verify 2 โหมด** — วงสด: เซ็ตลิสต์ล่วงหน้า (ตาม spec ไม่พึ่ง fingerprint วงสดที่แม่นแค่ ~87%) · DJ: audio-scan (PoC = sha256 fingerprint mock ต่อไฟล์ WAV; production interface เดียวกันกับ ACRCloud free trial)
5. **Receipt** — hash(play_event) → data-only tx จริงบน BSC Testnet (chainId 97) · wallet: สร้างด้วย `npm run wallet` (3 roles: platform/deploy, venue, fan — key เก็บใน `.env` local เท่านั้น — TESTNET ห้ามใช้จริง)
6. **Split ledger 70/10/20** — dashboard สะสม 3 ฝั่ง (ค่าย/ร้าน/แพลตฟอร์ม) + ตารางรายการล่าสุด

## ตัวเลขต้นทุน (มีที่มา)

- ต่อ receipt: ใช้จริง **29,560 gas** (gas cap 40,000) × ~0.1 gwei (gasPrice จริงบน BSC Testnet วัด 26 Nov) ≈ **0.000003 BNB/tx** — ไม่ถึง 1 สตางค์ · mainnet BSC ~0.05 gwei → ~<$0.01/receipt (ยืนยันจาก receipt `0x931eb75c…`, block 144974404)
- ACRCloud: ~$5/1,000 scans = ~0.17฿/จับ (VERIFIED — autovj.club / acrcloud.com free trial 14 วัน)

## รันเอง

```bash
cd ~/workspace/tedfund-lab/poc
npm install
npm run wallet      # สร้าง/โหลด wallet จาก .env
npm run make-audio  # สร้าง mock WAV fingerprint (ต้องรันก่อน start ครั้งแรก)
npm start           # :3000 (มี systemd playright-poc.service รันอยู่แล้ว)
npm run e2e         # 19 assertions — flow จริง + tx จริง + วัด ≤30s
```

**Reset ก่อนเดโมวันศุกร์ (เผื่ออยากเริ่ม ledger สะอาด):** `rm -rf data && sudo systemctl restart playright-poc` — tx เก่าบน chain ไม่หาย (เป็นหลักฐานความสามารถอยู่แล้ว)

## สิ่งที่ยังไม่ทำ (จงใจ — ตาม scope PoC)

- รับเงินจริงผ่าน PromptPay (ต้อง Payment Facilitator / BOT sandbox — โครงสร้าง WORPT convert-at-payment, phase 2)
- ACRCloud integration จริง (สมัคร free trial 14 วัน — ใช้ interface เดิม แค่เปลี่ยน verify backend)
- contract/event logs บน chain (ตอนนี้ data-only tx — พอสำหรับ "ลิงก์ tx ที่กดดูได้")
- stablecoin จริง, mobile app, สมาชิก — ตัดตาม spec
