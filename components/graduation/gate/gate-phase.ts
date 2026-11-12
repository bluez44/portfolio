export type GatePhase = "arriving" | "ready" | "opening" | "done";

export type GateEvent = { type: "resourcesReady" } | { type: "open" } | { type: "openFinished" };

/** The intro cover: waits for resources, opens once, and is done when its exit animation finishes. */
export function gateReducer(phase: GatePhase, event: GateEvent): GatePhase {
  switch (event.type) {
    case "resourcesReady":
      return phase === "arriving" ? "ready" : phase;
    case "open":
      return phase === "ready" ? "opening" : phase;
    case "openFinished":
      return phase === "opening" ? "done" : phase;
  }
}
