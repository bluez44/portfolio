const EPS = 1e-9;

/**
 * Gates render ticks so an idle scene renders at most `idleFps` times per second while still
 * rendering every tick when `busy` (e.g. scrolling or interpolating a pose).
 */
export function createFrameGovernor(idleFps: number): (timeSec: number, busy: boolean) => boolean {
  const minInterval = 1 / idleFps;
  let lastRendered: number | null = null;

  return (timeSec, busy) => {
    if (!busy && lastRendered !== null && timeSec - lastRendered < minInterval - EPS) {
      return false;
    }
    lastRendered = timeSec;
    return true;
  };
}
