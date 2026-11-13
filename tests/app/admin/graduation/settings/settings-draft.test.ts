import { describe, expect, it } from "vitest";
import { countChanges, settingsDraftReducer } from "@/app/admin/graduation/settings/draft/settings-draft";

describe("settingsDraftReducer", () => {
  it("sets and clears a copy override per language", () => {
    const set = settingsDraftReducer({}, { type: "copy", lang: "en", key: "met.intro", value: "Hi" });
    expect(set.copy?.en).toEqual({ "met.intro": "Hi" });
    expect(settingsDraftReducer(set, { type: "copy", lang: "en", key: "met.intro", value: "" }).copy?.en).toEqual({});
  });
  it("resets a field in both languages", () => {
    const state = { copy: { vi: { "met.intro": "A", "card.body": "B" }, en: { "met.intro": "C" } } };
    expect(settingsDraftReducer(state, { type: "resetCopy", key: "met.intro" }).copy).toEqual({ vi: { "card.body": "B" }, en: {} });
  });
  it("stores blank owner, event and image values as unset", () => {
    const state = settingsDraftReducer({ owner: { name: "A" } }, { type: "owner", key: "name", value: "" });
    expect(state.owner?.name).toBeUndefined();
    expect(settingsDraftReducer({}, { type: "event", key: "start", value: undefined }).event?.start).toBeUndefined();
    expect(settingsDraftReducer({}, { type: "image", key: "badgeLogo", value: "/l.png" }).images).toEqual({ badgeLogo: "/l.png" });
  });
  it("replaces the moments", () => {
    expect(settingsDraftReducer({}, { type: "moments", value: [{ year: "1", image: "" }] }).moments).toEqual([{ year: "1", image: "" }]);
  });
});

describe("countChanges", () => {
  it("is zero for equivalent content", () => {
    expect(countChanges({}, { owner: {}, moments: [], copy: { vi: {} } })).toBe(0);
  });
  it("counts each changed leaf once", () => {
    const saved = { owner: { name: "A" }, copy: { vi: { "met.intro": "X" } } };
    const draft = { owner: { name: "B" }, copy: { vi: { "met.intro": "X" }, en: { "met.intro": "Y" } }, moments: [{ year: "1", image: "" }] };
    expect(countChanges(saved, draft)).toBe(3);
  });
});
