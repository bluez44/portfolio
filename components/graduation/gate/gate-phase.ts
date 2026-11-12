export type GatePhase = "arriving" | "ready" | "opening" | "done";

export type GateEvent = { type: "resourcesReady" } | { type: "open"; animate: boolean } | { type: "openFinished" };

/** The "you've got mail" cover: waits for resources, opens once, then gets out of the way. */
export function gateReducer(phase: GatePhase, event: GateEvent): GatePhase {
  switch (event.type) {
    case "resourcesReady":
      return phase === "arriving" ? "ready" : phase;
    case "open":
      if (phase !== "ready") return phase;
      return event.animate ? "opening" : "done";
    case "openFinished":
      return phase === "opening" ? "done" : phase;
  }
}
