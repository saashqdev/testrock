import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { clearSubscriptionsCache } from "@/utils/services/server/subscriptionService";
import { SubscriptionFeatureInPlansDto } from "@/lib/dtos/subscriptions/SubscriptionFeatureInPlansDto";

export async function POST(request: NextRequest) {
  try {
    await verifyUserHasPermission("admin.pricing.update");

    const body = await request.json();
    const { action, planIds, features } = body;

    if (action === "update-features") {
      const plans = await db.subscriptionProducts.getSubscriptionProductsInIds(planIds);

      if (plans.length === 0) {
        return NextResponse.json({ error: "No plans found" }, { status: 400 });
      }

      const featuresInPlans = features as SubscriptionFeatureInPlansDto[];

      await Promise.all(
        plans.map(async (plan) => {
          await db.subscriptionProducts.deleteSubscriptionFeatures(plan.id ?? "");
          const planFeatures = featuresInPlans.filter((f) => f.plans.find((p) => p.id === plan.id));

          await Promise.all(
            planFeatures
              .sort((a, b) => a.order - b.order)
              .map(async ({ order, name, href, badge, plans, accumulate }) => {
                const feature = plans.find((p) => p.id === plan.id);
                if (!feature) {
                  return;
                }
                return await db.subscriptionProducts.createSubscriptionFeature(plan.id ?? "", {
                  order,
                  name,
                  title: feature.title,
                  type: feature.type,
                  value: feature.value,
                  href,
                  badge,
                  accumulate,
                });
              })
          );
        })
      );

      await clearSubscriptionsCache();

      return NextResponse.json({ success: "Features updated" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating pricing features:", error);

    if (error instanceof Error && error.message.includes("permission")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
