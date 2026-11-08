import { cookies } from "next/headers";
import { ADMIN_SESSION_MAX_AGE_MS, signAdminToken, verifyAdminToken } from "./token";

export const ADMIN_COOKIE = "admin_auth";

export function readAdminSecret(): string | null {
  return process.env.ADMIN_SESSION_SECRET || null;
}

export async function isAdminSession(): Promise<boolean> {
  const secret = readAdminSecret();
  if (!secret) return false;
  const cookieStore = await cookies();
  return verifyAdminToken(cookieStore.get(ADMIN_COOKIE)?.value, secret);
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdminSession())) throw new Error("Unauthorized");
}

export async function startAdminSession(): Promise<void> {
  const secret = readAdminSecret();
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set");
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, signAdminToken(secret), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_MS / 1000,
  });
}
