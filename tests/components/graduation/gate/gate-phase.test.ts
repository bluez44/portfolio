import { describe, expect, it } from "vitest";
import { gateReducer, type GateEvent, type GatePhase } from "@/components/graduation/gate/gate-phase";

const run = (events: GateEvent[], from: GatePhase = "arriving") => events.reduce(gateReducer, from);

describe("gateReducer", () => {
  it("becomes openable once resources are ready", () => {
    expect(run([{ type: "resourcesReady" }])).toBe("ready");
  });
  it("ignores opening before the letter is ready", () => {
    expect(run([{ type: "open" }])).toBe("arriving");
  });
  it("plays the opening animation, then finishes", () => {
    expect(run([{ type: "resourcesReady" }, { type: "open" }])).toBe("opening");
    expect(run([{ type: "resourcesReady" }, { type: "open" }, { type: "openFinished" }])).toBe("done");
  });
  it("opens only once when the seal is pressed twice", () => {
    expect(run([{ type: "resourcesReady" }, { type: "open" }, { type: "open" }])).toBe("opening");
  });
  it("never reopens or regresses after done", () => {
    const events: GateEvent[] = [{ type: "resourcesReady" }, { type: "open" }, { type: "open" }, { type: "openFinished" }];
    expect(run(events, "done")).toBe("done");
  });
  it("ignores a stray openFinished", () => {
    expect(run([{ type: "openFinished" }], "ready")).toBe("ready");
  });
});
