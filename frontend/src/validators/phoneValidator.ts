/**
 * Normalisasi nomor HP Indonesia ke format 62xxxxxxxxxx
 * Contoh: 0856-9922-1143 -> 6285699221143
 */
export function normalizePhone(input: string): string {
  let n = input.replace(/[\s\-().]/g, '');
  if (n.startsWith('+')) n = n.slice(1);
  if (n.startsWith('0')) n = '62' + n.slice(1);
  return n;
}

/**
 * Validasi nomor HP seluler Indonesia (08xx / 628xx / +628xx)
 */
export function isValidIndoMobile(input: string): boolean {
  return /^628[1-9]\d{7,10}$/.test(normalizePhone(input));
}