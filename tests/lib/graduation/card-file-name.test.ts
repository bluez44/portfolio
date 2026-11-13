import { describe, expect, it } from "vitest";
import { cardFileName } from "@/lib/graduation/card-file-name";

describe("cardFileName", () => {
  it("slugs the guest name", () => {
    expect(cardFileName("Đại Việt")).toBe("thiep-moi-dai-viet.png");
  });

  it("falls back when the name has nothing slug-able", () => {
    expect(cardFileName("")).toBe("thiep-moi.png");
  });
});
