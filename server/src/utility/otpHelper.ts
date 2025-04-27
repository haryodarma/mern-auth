export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateOtpExpireAt(): number {
  return Date.now() + 10 * 60 * 1000;
}
