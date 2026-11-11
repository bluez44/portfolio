/**
 * Deterministic bee alias generator.
 *
 * Given a stable guest ID string, produces a funny Vietnamese/mixed
 * bee nickname (e.g. "Mèo Béo", "Rồng Lửa") that never changes for
 * the same guest — so the UI is consistent across page loads without
 * persisting anything extra in the database.
 */

const ADJECTIVES = [
  "Béo", "Lười", "Siêu", "Nhỏ", "To", "Vui", "Buồn",
  "Nhảy", "Bay", "Ngủ", "Hét", "Cười", "Bí Ẩn", "Huyền Thoại",
  "Tí Hon", "Khổng Lồ", "Điên Rồ", "Thần Kỳ", "Bất Tử", "Vô Địch",
  "Chăm Chỉ", "Cần Mẫn", "Đáng Yêu", "Lém Lỉnh", "Tinh Nghịch",
  "Ngố Tàu", "Hay Quên", "Hóng Hớt", "Nhiệt Huyết", "Mộng Mơ",
  "Dũng Cảm", "Nhút Nhát", "Điệu Đà", "Nhanh Trí", "Hóm Hỉnh",
  "Bá Đạo", "Dịu Dàng", "Ấm Áp", "Lạc Quan", "Chill Chill",
  "Ngáo Ngơ", "Thông Thái", "Hào Phóng", "Cute", "To Bự",
  "Tăng Động", "Lăn Tăn", "Ngoan Ngoãn", "Tử Tế", "Vui Tính",
  "Bảnh Tỏn", "Dễ Thương", "Rực Rỡ", "Ngọt Ngào", "Siêu Cấp",
  "Tập Sự", "Chúa Hề", "Lạ Lùng", "Hay Cười", "Nhiệt Tình",
];

const NOUNS = [
  "Ong",
];

/** Lightweight 32-bit hash of a string (FNV-1a variant). */
function fnv32(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0; // keep as unsigned 32-bit
  }
  return hash;
}

export function beeAlias(guestId: string): string {
  const h = fnv32(guestId);
  // Split the hash into two parts to pick adjective and noun independently.
  const adjIdx = h % ADJECTIVES.length;
  const nounIdx = Math.floor(h / ADJECTIVES.length) % NOUNS.length;
  return `${NOUNS[nounIdx]} ${ADJECTIVES[adjIdx]}`;
}
