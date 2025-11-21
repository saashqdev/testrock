import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const userEmail = process.argv[2] || "admin@email.com";

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
  console.log(`   Has AdminUser record: ${user.admin ? "✅ YES" : "❌ NO"}`);

  if (!user.admin) {
    console.log(`\n🔧 Creating AdminUser record...`);
    await prisma.adminUser.create({
      data: {
        userId: user.id,
      },
    });
    console.log(`✅ AdminUser record created!`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
