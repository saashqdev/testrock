import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const userEmail = process.argv[2] || "marge.simpson@company.com";

  // Find the user
  const user = await prisma.user.findFirst({
    where: { email: userEmail },
    include: { admin: true },
  });

  if (!user) {
    console.log(`❌ User ${userEmail} not found`);
    return;
  }

  console.log(`\n👤 User: ${user.email} (${user.id})`);
  console.log(`   Admin: ${user.admin ? "✅ YES" : "❌ NO"}\n`);

  // Get all tenants the user is a member of
  const tenantUsers = await prisma.tenantUser.findMany({
    where: { userId: user.id },
    include: {
      tenant: true,
    },
  });

  console.log(`🏢 Member of ${tenantUsers.length} tenant(s):\n`);

  for (const tu of tenantUsers) {
    console.log(`   ${tu.tenant.name} (${tu.tenant.slug})`);
    console.log(`   └─ Type: ${tu.type === 0 ? "OWNER" : tu.type === 1 ? "ADMIN" : "MEMBER"}`);

    // Get roles in this tenant
    const userRoles = await prisma.userRole.findMany({
      where: {
        userId: user.id,
        tenantId: tu.tenantId,
      },
      include: {
        role: true,
      },
    });

    if (userRoles.length > 0) {
      console.log(`   └─ Roles: ${userRoles.map((ur) => ur.role.name).join(", ")}`);
    } else {
      console.log(`   └─ Roles: ⚠️ NONE`);
    }
    console.log();
  }

  console.log("\n💡 To fix session issues:");
  console.log("   1. Go to: http://localhost:3000/logout");
  console.log("   2. Log back in with: " + userEmail);
  console.log("   3. Or clear the RSN_session cookie from browser DevTools\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
