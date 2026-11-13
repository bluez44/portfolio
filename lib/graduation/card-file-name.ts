import { toSlug } from "./slug";

/** "Nguyễn Minh Anh" → "thiep-moi-nguyen-minh-anh.png". */
export function cardFileName(guestName: string): string {
  const slug = toSlug(guestName);
  return slug ? `thiep-moi-${slug}.png` : "thiep-moi.png";
}
