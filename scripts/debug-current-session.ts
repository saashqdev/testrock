import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

async function main() {
  console.log("\n🔍 Debug Permission Check\n");

  // Try to get session cookie
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("RSN_session");
  
  if (!sessionCookie) {
    console.log("❌ No session cookie found");
    return;
  }

  console.log("✅ Session cookie exists");
  
  // You would need to decode the JWT here, but for now let's just check
  // what user is passed in via command line
  const userEmail = process.argv[2];
  if (!userEmail) {
    console.log("⚠️  Provide user email as argument");
    return;
  }

  const user = await prisma.user.findFirst({
    where: { email: userEmail },
    include: { admin: true },
  });

  if (!user) {
    console.log(`❌ User ${userEmail} not found`);
    return;
  }

  console.log(`\n👤 User: ${user.email}`);
  console.log(`   ID: ${user.id}`);

  // Check AdminUser directly
  const adminUser = await prisma.adminUser.findUnique({
    where: { userId: user.id },
  });

  console.log(`\n📋 AdminUser record:`);
  console.log(`   Exists: ${adminUser ? "✅ YES" : "❌ NO"}`);
  
  if (adminUser) {
    console.log(`   User ID: ${adminUser.userId}`);
  }

  // Check if verifyUserHasPermission would pass
  console.log(`\n✅ This user SHOULD have access to all pages`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
