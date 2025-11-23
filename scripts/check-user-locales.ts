import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkUserLocales() {
  console.log("🔍 Checking user locales...\n");

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      locale: true,
      firstName: true,
      lastName: true,
    },
  });

  console.log(`📊 Found ${users.length} users:\n`);

  for (const user of users) {
    console.log(`User: ${user.firstName} ${user.lastName} (${user.email})`);
    console.log(`Locale: ${user.locale || "NOT SET (null)"}`);
    console.log("---");
  }
}

checkUserLocales()
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
