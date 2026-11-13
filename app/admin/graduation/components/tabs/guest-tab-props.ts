import type { GuestPlaceholders } from "@/lib/graduation/content/guest-placeholders";
import type { GuestContent } from "@/lib/graduation/content/settings-types";

export type GuestTabProps = { content: GuestContent; placeholders: GuestPlaceholders; onChange: (next: GuestContent) => void };
