import { z } from "zod";
import { SLUG_MAX_LENGTH, SLUG_PATTERN } from "./slug";

export const rsvpInputSchema = z.object({
  slug: z.string().max(SLUG_MAX_LENGTH).regex(SLUG_PATTERN),
  status: z.enum(["yes", "no"]),
});
