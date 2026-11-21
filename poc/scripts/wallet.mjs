// Wallet helper — create/load Base Sepolia testnet wallet from .env
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { existsSync, readFileSync, appendFileSync } from 'node:fs';

if (!existsSync('.env')) {
  const pk = generatePrivateKey();
  appendFileSync('.env', `PRIVATE_KEY=${pk}\n`);
  const acc = privateKeyToAccount(pk);
  console.log('สร้าง wallet ใหม่ใน .env');
  console.log('address:', acc.address);
  console.log('⚠️ ยังต้อง fund ด้วย Base Sepolia ETH จาก faucet เท่านั้น (testnet — ห้ามใช้ key จริง)');
} else {
  const env = readFileSync('.env', 'utf8');
  const pk = env.match(/PRIVATE_KEY=(\S+)/)?.[1];
  if (pk) {
    const acc = privateKeyToAccount(pk.startsWith('0x') ? pk : `0x${pk}`);
    console.log('wallet มีอยู่แล้ว — address:', acc.address);
    console.log('fund ที่: faucet Base Sepolia (Coinbase dev / Alchemy / ถาม Poom สำหรับ dev wallet)');
  }
}
