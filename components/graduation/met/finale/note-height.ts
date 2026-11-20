import type { FinaleElements } from "../elements";
import { noteScaleFor } from "./note-finale";

/** Publishes the grown note's height (px) on the pin as `--note-h`, which the phone photo rows sit below. */
export function setNoteHeight({ pin, note }: Pick<FinaleElements, "pin" | "note">): void {
  const scale = noteScaleFor({ noteW: note.offsetWidth, noteH: note.offsetHeight, vw: window.innerWidth, vh: window.innerHeight });
  pin.style.setProperty("--note-h", `${note.offsetHeight * scale}px`);
}
