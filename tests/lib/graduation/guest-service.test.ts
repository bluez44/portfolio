import { describe, expect, it, vi } from "vitest";
import { saveGuest } from "@/lib/graduation/guest-service";
import { SlugTakenError } from "@/lib/graduation/slug-taken-error";
import type { GuestData, GuestRecord } from "@/lib/graduation/types";

function fakeRepo(overrides: Partial<{ fail: Error }> = {}) {
  const record = (data: GuestData): GuestRecord => ({ id: "g1", customContent: data.customContent ?? null, ...data });
  return {
    create: vi.fn(async (data: GuestData) => {
      if (overrides.fail) throw overrides.fail;
      return record(data);
    }),
    update: vi.fn(async (_id: string, data: GuestData) => {
      if (overrides.fail) throw overrides.fail;
      return record(data);
    }),
  };
}

describe("saveGuest", () => {
  it("derives the slug from the name when blank", async () => {
    const repo = fakeRepo();
    await expect(saveGuest(repo, { name: "Nguyễn Minh Anh", slug: "", note: "" })).resolves.toEqual({ ok: true });
    expect(repo.create).toHaveBeenCalledWith({ name: "Nguyễn Minh Anh", slug: "nguyen-minh-anh", note: null });
  });

  it("uses update when an id is given", async () => {
    const repo = fakeRepo();
    await saveGuest(repo, { name: "A", slug: "a", note: "hi" }, "g1");
    expect(repo.update).toHaveBeenCalledWith("g1", { name: "A", slug: "a", note: "hi" });
  });

  it("returns a slug error when the name has no slug-able characters", async () => {
    const repo = fakeRepo();
    const result = await saveGuest(repo, { name: "🎓 !!!", slug: "", note: "" });
    expect(result).toEqual({ ok: false, fieldErrors: { slug: "Không tạo được slug từ tên, hãy nhập tay" } });
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("maps SlugTakenError to a slug field error", async () => {
    const result = await saveGuest(fakeRepo({ fail: new SlugTakenError() }), { name: "A", slug: "a", note: "" });
    expect(result).toEqual({ ok: false, fieldErrors: { slug: "Slug đã tồn tại" } });
  });

  it("returns schema field errors", async () => {
    const result = await saveGuest(fakeRepo(), { name: "", slug: "Bad", note: "" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(Object.keys(result.fieldErrors).sort()).toEqual(["name", "slug"]);
  });

  it("rethrows unknown repository errors", async () => {
    await expect(saveGuest(fakeRepo({ fail: new Error("db down") }), { name: "A", slug: "a", note: "" })).rejects.toThrow("db down");
  });

  it("reports where invalid custom content is wrong", async () => {
    const repo = fakeRepo();
    const result = await saveGuest(repo, { name: "A", slug: "a", note: "", customContent: { vi: { "gate.tapBee": "x" } } });
    expect(result).toEqual({ ok: false, fieldErrors: { customContent: "vi.gate.tapBee: Trường không tồn tại" } });
  });

  it("accepts and converts legacy custom content", async () => {
    const repo = fakeRepo();
    await saveGuest(repo, { name: "A", slug: "a", note: "", customContent: { envelope: { cardGreeting: "Kính gửi," } } });
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ customContent: expect.objectContaining({ vi: { "card.greeting": "Kính gửi," } }) }));
  });
});
