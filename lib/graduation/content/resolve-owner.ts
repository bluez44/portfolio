import { DEFAULT_OWNER } from "./defaults";
import type { OwnerSettings } from "./settings-types";

export type ResolvedOwner = { name: string; initials: string; website: string; phone: string | null };

export const resolveOwner = (settings: OwnerSettings | undefined, envPhone: string | null): ResolvedOwner => ({
  name: settings?.name || DEFAULT_OWNER.name,
  initials: settings?.initials || DEFAULT_OWNER.initials,
  website: settings?.website || DEFAULT_OWNER.website,
  phone: settings?.phone || envPhone || null,
});
