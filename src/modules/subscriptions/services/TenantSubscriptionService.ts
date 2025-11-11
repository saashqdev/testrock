import { db } from "@/db";
import { TenantSubscriptionWithDetailsDto } from "@/db/models";
import { clearCacheKey } from "@/lib/services/cache.server";

export async function getOrPersistTenantSubscription(tenantId: string): Promise<TenantSubscriptionWithDetailsDto> {
  const subscription = await db.tenantSubscriptions.getTenantSubscription(tenantId);

  if (subscription) {
    return subscription;
  }
  await db.tenantSubscriptions.createTenantSubscription(tenantId, "");
  const item = await db.tenantSubscriptions.getTenantSubscription(tenantId);
  if (!item) {
    throw new Error("Could not create tenant subscription");
  }
  return item;
}

export async function updateTenantSubscription(tenantId: string, data: { stripeCustomerId: string }): Promise<void> {
  await db.tenantSubscriptions
    .updateTenantSubscriptionCustomerId(tenantId, {
      stripeCustomerId: data.stripeCustomerId,
    })
    .then((item) => {
      clearCacheKey(`tenantSubscription:${tenantId}`);
      return item;
    });
}

export async function createTenantSubscriptionProduct(data: {
  tenantSubscriptionId: string;
  subscriptionProductId: string;
  stripeSubscriptionId?: string;
  quantity?: number;
  fromCheckoutSessionId?: string | null;
  prices: {
    subscriptionPriceId?: string;
    subscriptionUsageBasedPriceId?: string;
  }[];
}): Promise<string> {
  const result = await db.tenantSubscriptionProducts
    .addTenantSubscriptionProduct({
      tenantSubscriptionId: data.tenantSubscriptionId,
      subscriptionProductId: data.subscriptionProductId,
      stripeSubscriptionId: data.stripeSubscriptionId,
      quantity: data.quantity,
      fromCheckoutSessionId: data.fromCheckoutSessionId,
      prices: data.prices.map((price) => ({
        subscriptionPriceId: price.subscriptionPriceId,
        subscriptionUsageBasedPriceId: price.subscriptionUsageBasedPriceId,
      })),
    })
    .then(async (created) => {
      const tenantSubscription = await db.tenantSubscriptions.getTenantSubscription(data.tenantSubscriptionId);
      if (tenantSubscription) {
        clearCacheKey(`tenantSubscription:${tenantSubscription.tenantId}`);
      }
      // If 'created' is an object, extract the string id property (commonly 'id')
      return typeof created === "string" ? created : created.id;
    });
  return result;
}
