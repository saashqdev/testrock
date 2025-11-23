import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const userEmail = process.argv[2] || "marge.simpson@company.com";
  const tenantSlug = process.argv[3] || "acme-corp-2";
  const permissionName = process.argv[4] || "app.settings.apiKeys.view";

  // Find the user
  const user = await prisma.user.findFirst({
    where: { email: userEmail },
  });

  if (!user) {
    console.log(`❌ User ${userEmail} not found`);
    return;
  }

  // Find the tenant
  const tenant = await prisma.tenant.findFirst({
    where: { slug: tenantSlug },
  });

  if (!tenant) {
    console.log(`❌ Tenant ${tenantSlug} not found`);
    return;
  }

  console.log(`\n👤 User: ${user.email} (${user.id})`);
  console.log(`🏢 Tenant: ${tenant.name} (${tenant.id})`);
  console.log(`🔑 Permission: ${permissionName}\n`);

  // Check if user is in tenant
  const tenantUser = await prisma.tenantUser.findFirst({
    where: {
      userId: user.id,
      tenantId: tenant.id,
    },
  });

  if (!tenantUser) {
    console.log(`❌ User is NOT in tenant`);
    return;
  }

  console.log(`✅ User is in tenant (type: ${tenantUser.type})`);

  // Get user's roles in this tenant
  const userRoles = await prisma.userRole.findMany({
    where: {
      userId: user.id,
      tenantId: tenant.id,
    },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  console.log(`\n📋 User's roles in tenant:`);
  for (const ur of userRoles) {
    console.log(`  - ${ur.role.name} (${ur.role.type})`);
    console.log(`    Permissions:`);
    for (const rp of ur.role.permissions) {
      console.log(`      - ${rp.permission.name}`);
    }
  }

  // Check specific permission
  const hasPermission = userRoles.some((ur) => ur.role.permissions.some((rp) => rp.permission.name === permissionName));

  console.log(`\n🔍 Has '${permissionName}': ${hasPermission ? "✅ YES" : "❌ NO"}`);

  // Count using the same query as the app
  const count = await prisma.userRole.count({
    where: {
      userId: user.id,
      tenantId: tenant.id,
      role: {
        permissions: {
          some: {
            permission: {
              name: permissionName,
            },
          },
        },
      },
    },
  });

  console.log(`\n📊 Permission count (app query): ${count}`);
  console.log(`   Result: ${count > 0 ? "✅ ALLOWED" : "❌ DENIED"}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
