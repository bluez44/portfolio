import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function signAdminToken(secret: string, now: number = Date.now()): string {
  const issuedAt = String(now);
  return `${issuedAt}.${sign(issuedAt, secret)}`;
}

export function verifyAdminToken(
  token: string | undefined,
  secret: string,
  now: number = Date.now(),
): boolean {
  if (!token) return false;
  const [issuedAt, signature, extra] = token.split(".");
  if (!issuedAt || !signature || extra !== undefined || !/^\d+$/.test(issuedAt)) return false;

  const expected = Buffer.from(sign(issuedAt, secret), "hex");
  const actual = Buffer.from(signature, "hex");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;

  const age = now - Number(issuedAt);
  return age >= 0 && age <= ADMIN_SESSION_MAX_AGE_MS;
}
