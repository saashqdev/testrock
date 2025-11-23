import { db } from "@/db";
import { prisma } from "@/db/config/prisma/database";

async function checkSubscription() {
  try {
    const tenantSlug = process.argv[2] || "acme-corp-3";

    console.log(`\n🔍 Checking subscription for tenant: ${tenantSlug}\n`);

    // Get tenant
    const tenant = await prisma.tenant.findFirst({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      console.error(`❌ Tenant not found: ${tenantSlug}`);
      process.exit(1);
    }

    console.log(`✅ Tenant found: ${tenant.name} (ID: ${tenant.id})`);

    // Get tenant subscription
    const tenantSubscription = await prisma.tenantSubscription.findUnique({
      where: { tenantId: tenant.id },
      include: {
        products: {
          include: {
            subscriptionProduct: {
              include: {
                features: true,
              },
            },
            prices: {
              include: {
                subscriptionPrice: true,
                subscriptionUsageBasedPrice: true,
              },
            },
          },
        },
      },
    });

    if (!tenantSubscription) {
      console.log("❌ No tenant subscription record found");
      process.exit(1);
    }

    console.log(`\n📦 Tenant Subscription:`);
    console.log(`   Stripe Customer ID: ${tenantSubscription.stripeCustomerId || "N/A"}`);
    console.log(`   Products count: ${tenantSubscription.products.length}`);

    if (tenantSubscription.products.length === 0) {
      console.log("\n⚠️  No subscription products found!");
    } else {
      console.log(`\n📋 Subscription Products:`);
      tenantSubscription.products.forEach((product, idx) => {
        console.log(`\n   Product #${idx + 1}:`);
        console.log(`   - Product: ${product.subscriptionProduct.title}`);
        console.log(`   - Quantity: ${product.quantity}`);
        console.log(`   - Stripe Subscription ID: ${product.stripeSubscriptionId || "N/A"}`);
        console.log(`   - Created: ${product.createdAt}`);
        console.log(`   - Cancelled At: ${product.cancelledAt || "N/A"}`);
        console.log(`   - Ends At: ${product.endsAt || "N/A"}`);
        console.log(`   - Current Period: ${product.currentPeriodStart || "N/A"} to ${product.currentPeriodEnd || "N/A"}`);
        console.log(`   - From Checkout: ${product.fromCheckoutSessionId || "N/A"}`);

        // Check if it would be filtered out
        if (product.endsAt && new Date(product.endsAt) <= new Date()) {
          console.log(`   ⚠️  This product is EXPIRED (ends at ${product.endsAt})`);
        } else if (product.endsAt) {
          console.log(`   ⏰ This product will end at ${product.endsAt}`);
        } else {
          console.log(`   ✅ This product is ACTIVE (no end date)`);
        }
      });
    }

    // Check checkout session status
    console.log(`\n💳 Recent Checkout Sessions:`);
    const checkoutSessions = await prisma.checkoutSessionStatus.findMany({
      where: { fromTenantId: tenant.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    if (checkoutSessions.length === 0) {
      console.log("   No checkout sessions found");
    } else {
      checkoutSessions.forEach((session) => {
        console.log(`\n   Session: ${session.id}`);
        console.log(`   - Created: ${session.createdAt}`);
        console.log(`   - Pending: ${session.pending}`);
        console.log(`   - From URL: ${session.fromUrl || "N/A"}`);
      });
    }

    // Test getActiveTenantSubscriptions
    console.log(`\n🔄 Testing getActiveTenantSubscriptions function:`);
    const activeSubscription = await db.tenantSubscriptions.getTenantSubscription(tenant.id);
    if (activeSubscription) {
      const activeProducts = activeSubscription.products.filter((f) => !f.endsAt || new Date(f.endsAt) > new Date());
      console.log(`   Total products: ${activeSubscription.products.length}`);
      console.log(`   Active products (after filter): ${activeProducts.length}`);

      if (activeProducts.length === 0 && activeSubscription.products.length > 0) {
        console.log(`\n   ⚠️  WARNING: All products are filtered out!`);
        console.log(`   This explains why "No active subscriptions" is shown.`);
      }
    }
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkSubscription();
