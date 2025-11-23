/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkPermissions() {
  console.log("\n🔍 Checking Permissions for Admin User");
  console.log("=====================================\n");

  // Get admin user
  const adminUser = await prisma.user.findFirst({
    where: {
      admin: { isNot: null },
    },
  });

  if (!adminUser) {
    console.log("❌ No admin user found");
    await prisma.$disconnect();
    return;
  }

  console.log(`✅ Admin User: ${adminUser.email}`);

  // Check for admin entity permissions
  const entityPermissions = await prisma.permission.findMany({
    where: {
      name: {
        startsWith: "admin.entities",
      },
    },
    orderBy: { name: "asc" },
  });

  console.log(`\n📋 Admin Entity Permissions (${entityPermissions.length}):`);
  entityPermissions.forEach((perm: any) => {
    console.log(`   - ${perm.name}`);
  });

  // Check user's roles and permissions
  const userRoles = await prisma.userRole.findMany({
    where: { userId: adminUser.id },
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

  console.log(`\n👤 User Roles (${userRoles.length}):`);
  userRoles.forEach((userRole: any) => {
    console.log(`\n   Role: ${userRole.role.name}`);
    console.log(`   Permissions: ${userRole.role.permissions.length}`);
    userRole.role.permissions.slice(0, 5).forEach((rp: any) => {
      console.log(`      - ${rp.permission.name}`);
    });
    if (userRole.role.permissions.length > 5) {
      console.log(`      ... and ${userRole.role.permissions.length - 5} more`);
    }
  });

  await prisma.$disconnect();
  console.log("\n✅ Check complete!");
}

checkPermissions().catch((e) => {
  console.error(e);
  process.exit(1);
});
