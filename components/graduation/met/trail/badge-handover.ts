/**
 * The rider travels inside the scrolling column; the dock sits on the pinned note. Showing exactly
 * one keeps the badge glued to the note while it is pinned.
 */
export function handOverBadge(rider: HTMLElement, dock: HTMLElement, docked: boolean): void {
  rider.style.visibility = docked ? "hidden" : "visible";
  dock.style.visibility = docked ? "visible" : "hidden";
}
