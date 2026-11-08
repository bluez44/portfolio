export const SLUG_MAX_LENGTH = 64;
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** "Nguyễn Minh Anh" → "nguyen-minh-anh". Returns "" when nothing is slug-able. */
export function toSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/-+$/, "");
}

export function isValidSlug(value: string): boolean {
  return value.length <= SLUG_MAX_LENGTH && SLUG_PATTERN.test(value);
}

/** Normalises the `?to=` search param; null means "render 404". */
export function parseGuestSlug(value: string | string[] | undefined): string | null {
  if (typeof value !== "string") return null;
  const slug = value.trim().toLowerCase();
  return isValidSlug(slug) ? slug : null;
}
