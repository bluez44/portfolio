import { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import type { SettingsStore } from "./content/settings-store";

const SETTINGS_ID = "default";

export const settingsRepository: SettingsStore = {
  async read() {
    const row = await prisma.graduationSettings.findUnique({ where: { id: SETTINGS_ID }, select: { content: true } });
    return row?.content ?? null;
  },

  async write(content) {
    const json = content as unknown as Prisma.InputJsonValue;
    await prisma.graduationSettings.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID, content: json },
      update: { content: json },
    });
  },
};
