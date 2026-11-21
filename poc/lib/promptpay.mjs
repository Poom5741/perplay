// PromptPay payload generator — EMVCo QR spec (Thai PromptPay)
// Real payload format: TLV (tag-length-value) + CRC16-CCITT (poly 0x1021, init 0xFFFF)
// Ref: Bank of Thailand PromptPay QR standard ( slipsingle promptpay-th )

function tlv(tag, value) {
  const len = value.length.toString().padStart(2, '0');
  return `${tag}${len}${value}`;
}

function crc16(payload) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) crc = ((crc << 1) ^ 0x1021) & 0xffff;
      else crc = (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Generate a dynamic PromptPay QR payload.
 * @param {string} target - PromptPay ID (phone 10 digits / national ID 13 digits / ewallet)
 * @param {number} amountTHB
 * @param {string} ref - transaction reference (tag 62-05, max 25 chars)
 */
export function promptPayPayload(target, amountTHB, ref) {
  const cleanTarget = String(target).replace(/[^0-9]/g, '');
  if (!cleanTarget) throw new Error('PROMPTPAY_TARGET not configured');
  if (ref.length > 25) ref = ref.slice(0, 25);

  let payload = '';
  payload += tlv('00', '01');          // payload format indicator
  payload += tlv('01', '12');          // point of initiation = dynamic (12: one-time QR)
  payload += tlv('29',                 // merchant account info — PromptPay AID
    tlv('00', 'A000000677010111') +
    tlv(cleanTarget.length <= 13 ? '01' : '02', cleanTarget.length <= 13 ? '' : cleanTarget) +
    (cleanTarget.length <= 13 ? tlv('01', cleanTarget) : tlv('02', ''))
  );
  payload += tlv('52', '5812');        // MCC 5812 (eating places — venue profile) 
  payload += tlv('53', '764');         // currency = THB
  payload += tlv('54', amountTHB.toFixed(2));
  payload += tlv('58', 'TH');          // country
  payload += tlv('62', tlv('05', ref)); // additional data: bill number = play ref
  payload += '6304';
  payload += crc16(payload);
  return payload;
}

export { crc16 };
