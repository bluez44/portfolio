import { describe, expect, it, vi } from "vitest";
import { saveSettings } from "@/lib/graduation/content/settings-service";

describe("saveSettings", () => {
  it("writes validated, trimmed settings", async () => {
    const write = vi.fn(async () => {});
    const result = await saveSettings({ write }, { copy: { en: { "met.intro": " Hi " } } });
    expect(result.ok).toBe(true);
    expect(write).toHaveBeenCalledWith(expect.objectContaining({ copy: { en: { "met.intro": "Hi" } } }));
  });
  it("does not write invalid settings", async () => {
    const write = vi.fn(async () => {});
    const result = await saveSettings({ write }, { copy: { vi: { nope: "x" } } });
    expect(result).toEqual({ ok: false, fieldErrors: { "copy.vi.nope": "Trường không tồn tại" } });
    expect(write).not.toHaveBeenCalled();
  });
});
