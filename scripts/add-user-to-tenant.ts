import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tenantSlug = process.argv[2];
  const userEmail = process.argv[3];

  if (!tenantSlug || !userEmail) {
    console.log("Usage: npx tsx scripts/add-user-to-tenant.ts <tenant-slug> <user-email>");
    console.log("Example: npx tsx scripts/add-user-to-tenant.ts acme-corp-2 marge.simpson@company.com");
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

  // Find the user
  const user = await prisma.user.findFirst({
    where: { email: userEmail },
  });

  if (!user) {
    console.log(`❌ User ${userEmail} not found`);
    return;
  }

  console.log(`✅ Found tenant: ${tenant.name} (${tenant.id})`);
  console.log(`✅ Found user: ${user.email} (${user.id})`);

  // Check if user is already in tenant
  const existingTenantUser = await prisma.tenantUser.findFirst({
    where: {
      tenantId: tenant.id,
      userId: user.id,
    },
  });

  if (existingTenantUser) {
    console.log(`ℹ️ User is already in tenant`);
  } else {
    // Add user to tenant as ADMIN
    const tenantUser = await prisma.tenantUser.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        type: 1, // ADMIN
        joined: 0, // JOINED_BY_INVITATION
        status: 0, // ACTIVE
      },
    });
    console.log(`✅ Added user to tenant as ADMIN`);
  }

  // Get Admin role
  const adminRole = await prisma.role.findFirst({
    where: { name: "Admin", type: "app" },
  });

  if (!adminRole) {
    console.log(`❌ Admin role not found`);
    return;
  }

  // Check if user already has the role
  const existingUserRole = await prisma.userRole.findFirst({
    where: {
      userId: user.id,
      roleId: adminRole.id,
      tenantId: tenant.id,
    },
  });

  if (existingUserRole) {
    console.log(`ℹ️ User already has Admin role`);
  } else {
    // Assign Admin role
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: adminRole.id,
        tenantId: tenant.id,
      },
    });
    console.log(`✅ Assigned Admin role to user`);
  }

  console.log("\n✅ Done! User should now have access to the tenant.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
