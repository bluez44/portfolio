import { cache } from "react";
import { settingsRepository } from "../settings-repository";
import { readSettings } from "./read-settings";

export const loadGraduationSettings = cache(() => readSettings(settingsRepository));
