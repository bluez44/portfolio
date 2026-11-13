import { sanitizeSettings } from "./sanitize-settings";
import type { GraduationSettingsContent } from "./settings-types";
import type { SettingsStore } from "./settings-store";

export async function readSettings(store: Pick<SettingsStore, "read">): Promise<GraduationSettingsContent> {
  try {
    return sanitizeSettings(await store.read());
  } catch (error) {
    console.warn("[graduation-settings] using defaults, could not read settings", error);
    return {};
  }
}
