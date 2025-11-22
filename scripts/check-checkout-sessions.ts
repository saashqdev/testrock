import { prisma } from "@/db/config/prisma/database";

async function checkCheckoutSessions() {
  try {
    console.log(`\n🔍 Checking all recent checkout sessions\n`);

    const sessions = await prisma.checkoutSessionStatus.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    if (sessions.length === 0) {
      console.log("❌ No checkout sessions found");
    } else {
      console.log(`Found ${sessions.length} checkout sessions:\n`);
      sessions.forEach((session, idx) => {
        console.log(`Session #${idx + 1}:`);
        console.log(`   ID: ${session.id}`);
        console.log(`   Created: ${session.createdAt}`);
        console.log(`   Pending: ${session.pending}`);
        console.log(`   From User ID: ${session.fromUserId || "N/A"}`);
        console.log(`   From Tenant ID: ${session.fromTenantId || "N/A"}`);
        console.log(`   From URL: ${session.fromUrl || "N/A"}`);
        console.log(`   Created User ID: ${session.createdUserId || "N/A"}`);
        console.log(`   Created Tenant ID: ${session.createdTenantId || "N/A"}`);
        console.log("");
      });
    }

  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkCheckoutSessions();
