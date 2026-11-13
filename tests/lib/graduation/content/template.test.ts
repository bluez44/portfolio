import { describe, expect, it } from "vitest";
import { fillTemplate, templateTokens } from "@/lib/graduation/content/template";

describe("fillTemplate", () => {
  it("replaces known tokens", () => {
    expect(fillTemplate("Và bạn, {name}", { name: "Lan" })).toBe("Và bạn, Lan");
  });
  it("replaces every occurrence", () => {
    expect(fillTemplate("{year}-{year}", { year: "2026" })).toBe("2026-2026");
  });
  it("blanks tokens without a value instead of leaking braces", () => {
    expect(fillTemplate("Hi {name}!", {})).toBe("Hi !");
  });
  it("leaves text without tokens untouched", () => {
    expect(fillTemplate("Xin chào,", { name: "Lan" })).toBe("Xin chào,");
  });
});

describe("templateTokens", () => {
  it("lists unique token names in order", () => {
    expect(templateTokens("{weekday} {date}.{year} {date}")).toEqual(["weekday", "date", "year"]);
  });
  it("ignores braces that are not word tokens", () => {
    expect(templateTokens("{ name } {} {a-b}")).toEqual([]);
  });
});
