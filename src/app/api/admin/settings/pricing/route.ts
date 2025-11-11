import { NextRequest } from "next/server";
import { getServerTranslations } from "@/i18n/server";
import { verifyUserHasPermission } from "@/modules/permissions/services/UserPermissionsService";
import { db } from "@/db";
import { PricingModel } from "@/modules/subscriptions/enums/PricingModel";
import defaultPlans from "@/modules/subscriptions/data/defaultPlans.server";
import { createPlans, deletePlan, syncPlan } from "@/modules/subscriptions/services/PricingService";

export type PricingPlansActionData = {
  error?: string;
  success?: string;
  items?: Awaited<ReturnType<typeof db.subscriptionProducts.getAllSubscriptionProducts>>;
};

const badRequest = (data: PricingPlansActionData) => Response.json(data, { status: 400 });

export async function POST(request: NextRequest) {
  await verifyUserHasPermission("admin.pricing.update");
  const { t } = await getServerTranslations();

  const form = await request.formData();
  const action = form.get("action")?.toString();

  if (action === "create-all-plans") {
    await verifyUserHasPermission("admin.pricing.create");
    const model = Number(form.get("model")) as PricingModel;
    const items = await db.subscriptionProducts.getAllSubscriptionProducts();
    if (items.length > 0) {
      return Response.json({
        items,
      });
    }

    await Promise.all(
      defaultPlans
        .filter((f) => f.model === model || model === PricingModel.ALL)
        .map(async (plan) => {
          plan.translatedTitle = t(plan.title);
          plan.usageBasedPrices?.forEach((usageBasedPrice) => {
            usageBasedPrice.unitTitle = t(usageBasedPrice.unitTitle);
            usageBasedPrice.unitTitlePlural = t(usageBasedPrice.unitTitlePlural);
          });
        })
    );

    try {
      await createPlans(defaultPlans.filter((f) => f.model === model || model === PricingModel.ALL));
      await db.logs.createAdminLog(request, "Created pricing plans", defaultPlans.map((f) => t(f.title)).join(", "));

      return Response.json({
        items: await db.subscriptionProducts.getAllSubscriptionProducts(),
      });
    } catch (e: any) {
      return badRequest({ error: e?.toString() });
    }
  } else if (action === "sync-plan-with-payment-provider") {
    const id = form.get("id")?.toString() ?? "";
    const item = await db.subscriptionProducts.getSubscriptionProduct(id);
    if (!item) {
      return badRequest({ error: "Pricing plan not found" });
    }
    try {
      await syncPlan(
        { ...item, translatedTitle: t(item.title) },
        item.prices.map((price) => {
          return {
            id: price.id,
            billingPeriod: price.billingPeriod,
            currency: price.currency,
            price: Number(price.price),
          };
        })
      );
      return Response.json({
        items: await db.subscriptionProducts.getAllSubscriptionProducts(),
      });
    } catch (error: any) {
      return badRequest({ error: error.message });
    }
  } else if (action === "toggle") {
    const id = form.get("id")?.toString() ?? "";
    const item = await db.subscriptionProducts.getSubscriptionProduct(id);
    if (!item) {
      return badRequest({ error: "Pricing plan not found" });
    }
    try {
      await db.subscriptionProducts.updateSubscriptionProduct(id, {
        public: !item.public,
      });
      return Response.json({ success: `Plan is now ${!item.public ? "public" : "private"}` });
    } catch (error: any) {
      return badRequest({ error: error.message });
    }
  } else if (action === "bulk-delete") {
    await verifyUserHasPermission("admin.pricing.delete");
    const ids = form.getAll("ids[]");
    const items = await db.subscriptionProducts.getAllSubscriptionProducts();
    const itemsToDelete = items.filter((f) => ids.includes(f.id?.toString() ?? ""));
    await Promise.all(
      itemsToDelete.map(async (item) => {
        // eslint-disable-next-line no-console
        console.log({ item: item.title, tenantProducts: item.tenantProducts?.map((f) => f.tenantSubscriptionId) });
        if (item.tenantProducts && item.tenantProducts.length > 0) {
          throw new Error("Cannot delete a plan with active subscriptions: " + t(item.title));
        }
        await db.logs.createAdminLog(request, "Deleted pricing plan", item.id!);
      })
    );
    await Promise.all(
      itemsToDelete.map(async (item) => {
        await deletePlan(item);
      })
    );
    return Response.json({ success: "Deleted" });
  }

  return Response.json({ error: "Invalid action" }, { status: 400 });
}
