/** The owner's phone shown under the attend form; hidden when unset. Server-only (reads env). */
export function readOwnerPhone(env: Record<string, string | undefined> = process.env): string | null {
  return env.GRADUATION_OWNER_PHONE?.trim() || null;
}
