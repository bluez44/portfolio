import { z } from "zod";
import { risoColorSchema } from "./content/settings-rules";

export { risoColorSchema };

export const customMomentSchema = z.object({
  n: z.string().optional(),
  year: z.string().trim().default(""),
  title: z.string().trim().default(""),
  body: z.string().trim().default(""),
  image: z.string().trim().default(""),
  color: risoColorSchema.optional(),
  rot: z.number().optional(),
});

export const guestCustomContentSchema = z.object({
  envelope: z
    .object({
      coverLead: z.string().trim().optional(),
      coverAccent: z.string().trim().optional(),
      cardGreeting: z.string().trim().optional(),
      cardBody: z.string().trim().optional(),
      cardAuthor: z.string().trim().optional(),
      coverImage: z.string().trim().optional(),
    })
    .optional(),
  met: z
    .object({
      headingLead: z.string().trim().optional(),
      headingAccent: z.string().trim().optional(),
      intro: z.string().trim().optional(),
      moments: z.array(customMomentSchema).optional(),
      note: z.string().trim().optional(),
      togetherPhoto: z.string().trim().optional(),
    })
    .optional(),
  ends: z
    .object({
      headingLead: z.string().trim().optional(),
      headingAccent: z.string().trim().optional(),
      intro: z.string().trim().optional(),
      dateShort: z.string().trim().optional(),
      timeRange: z.string().trim().optional(),
      venue: z.string().trim().optional(),
      address: z.string().trim().optional(),
      notes: z.array(z.string().trim()).optional(),
      specialMessage: z.string().trim().optional(),
    })
    .optional(),
  rsvp: z
    .object({
      headingLead: z.string().trim().optional(),
      headingAccent: z.string().trim().optional(),
      prompt: z.string().trim().optional(),
    })
    .optional(),
  music: z
    .object({
      youtubeId: z.string().trim().optional(),
    })
    .optional(),
});

export type ValidatedCustomContent = z.infer<typeof guestCustomContentSchema>;
