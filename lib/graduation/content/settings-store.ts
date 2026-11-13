import type { GraduationSettingsContent } from "./settings-types";

export type SettingsStore = {
  read(): Promise<unknown>;
  write(content: GraduationSettingsContent): Promise<void>;
};
