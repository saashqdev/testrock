import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tenantSlug = process.argv[2] || "acme-corp-3";
  
  // Find the tenant
  const tenant = await prisma.tenant.findFirst({
    where: { slug: tenantSlug },
  });

  if (!tenant) {
    console.log(`❌ Tenant ${tenantSlug} not found`);
    return;
  }

  console.log(`✅ Found tenant: ${tenant.name} (${tenant.id})`);

  // Get all users in this tenant
  const tenantUsers = await prisma.tenantUser.findMany({
    where: { tenantId: tenant.id },
    include: {
      user: true,
    },
  });

  console.log(`\n📋 Users in ${tenant.name}:`);
  for (const tu of tenantUsers) {
    console.log(`  - ${tu.user.email} (type: ${tu.type})`);
    
    // Check their roles
    const userRoles = await prisma.userRole.findMany({
      where: {
        userId: tu.userId,
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

    console.log(`    Roles: ${userRoles.map(ur => ur.role.name).join(", ") || "NONE"}`);
    
    const hasPermission = userRoles.some(ur => 
      ur.role.permissions.some(rp => rp.permission.name === "app.settings.members.view")
    );
    
    console.log(`    Has members.view permission: ${hasPermission ? "✅" : "❌"}`);

    // If user has no roles, assign Admin role
    if (userRoles.length === 0) {
      console.log(`    ⚠️ User has no roles! Fixing...`);
      
      // Get Admin role
      const adminRole = await prisma.role.findFirst({
        where: { name: "Admin", type: "app" },
      });

      if (adminRole) {
        await prisma.userRole.create({
          data: {
            userId: tu.userId,
            roleId: adminRole.id,
            tenantId: tenant.id,
          },
        });
        console.log(`    ✅ Assigned Admin role`);
        
        // Also upgrade to ADMIN type
        await prisma.tenantUser.update({
          where: {
            id: tu.id,
          },
          data: {
            type: 1, // ADMIN
          },
        });
        console.log(`    ✅ Upgraded to ADMIN type`);
      }
    }
  }

  console.log("\n✅ Done!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
