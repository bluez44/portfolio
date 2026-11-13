import type { SettingsStore } from "./settings-store";
import { validateSettings, type SettingsValidation } from "./validate-settings";

export async function saveSettings(store: Pick<SettingsStore, "write">, raw: unknown): Promise<SettingsValidation> {
  const result = validateSettings(raw);
  if (result.ok) await store.write(result.data);
  return result;
}
