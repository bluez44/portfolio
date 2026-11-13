import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readSettings } from "@/lib/graduation/content/read-settings";

describe("readSettings", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sanitizes the stored row", async () => {
    const store = { read: async () => ({ copy: { vi: { "met.intro": "A", nope: "x" } } }) };
    expect((await readSettings(store)).copy?.vi).toEqual({ "met.intro": "A" });
  });
  it("returns empty settings when there is no row", async () => {
    expect(await readSettings({ read: async () => null })).toEqual({});
  });
  it("returns empty settings when the database fails", async () => {
    const store = { read: async () => Promise.reject(new Error("down")) };
    expect(await readSettings(store)).toEqual({});
    expect(console.warn).toHaveBeenCalled();
  });
});
