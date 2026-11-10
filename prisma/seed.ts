import "dotenv/config";
import prisma from "../lib/prisma";
import { toSlug } from "../lib/graduation/slug";

const SAMPLE_GUESTS = ["Ae guột", "Diệu", "Sang"];

async function main() {
  for (const name of SAMPLE_GUESTS) {
    const slug = toSlug(name);
    await prisma.guest.upsert({
      where: { slug },
      create: { slug, name },
      update: {},
    });
    console.log(`seeded /graduation?to=${slug} → ${name}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
