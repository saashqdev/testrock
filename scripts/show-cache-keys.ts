import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const userEmail = process.argv[2] || "marge.simpson@company.com";

  // Find the user
  const user = await prisma.user.findFirst({
    where: { email: userEmail },
  });

  if (!user) {
    console.log(`❌ User ${userEmail} not found`);
    return;
  }

  console.log(`\n👤 User: ${user.email} (${user.id})\n`);

  // Get all tenants
  const tenantUsers = await prisma.tenantUser.findMany({
    where: { userId: user.id },
    include: { tenant: true },
  });

  console.log(`🔑 Cache keys that need to be cleared:\n`);
  
  for (const tu of tenantUsers) {
    const cacheKey = `userRoles:${user.id}:${tu.tenantId}`;
    console.log(`   ${cacheKey}`);
  }

  console.log(`\n⚠️  This script just shows the cache keys.`);
  console.log(`   To clear the cache, restart your Next.js dev server:`);
  console.log(`   1. Stop the server (Ctrl+C)`);
  console.log(`   2. Start it again: pnpm dev`);
  console.log(`\n   Or if using Redis, flush it: redis-cli FLUSHDB\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
