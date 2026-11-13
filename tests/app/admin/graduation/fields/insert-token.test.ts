import { describe, expect, it } from "vitest";
import { insertToken } from "@/app/admin/graduation/components/fields/insert-token";

describe("insertToken", () => {
  it("inserts at the caret", () => {
    expect(insertToken("Hi !", 3, 3, "name")).toEqual({ value: "Hi {name}!", caret: 9 });
  });
  it("replaces the selection", () => {
    expect(insertToken("Hi you!", 3, 6, "name")).toEqual({ value: "Hi {name}!", caret: 9 });
  });
});
