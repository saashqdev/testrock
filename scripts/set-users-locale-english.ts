import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function setAllUsersToEnglish() {
  console.log("🔧 Setting all users' locale to English...\n");

  const result = await prisma.user.updateMany({
    data: {
      locale: "en",
    },
  });

  console.log(`✅ Updated ${result.count} users to English locale`);
  console.log("\nℹ️  You may need to:");
  console.log("  1. Log out and log back in");
  console.log("  2. Or clear your browser cookies (i18next cookie)");
  console.log("  3. Or run in browser console: document.cookie = 'i18next=en; path=/'; location.reload();");
}

setAllUsersToEnglish()
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
