import UrlUtils from "@/utils/app/UrlUtils";
import { db } from "@/db";
import { prisma } from "@/db/config/prisma/database";
import { deleteStripeCustomer } from "../stripe.server";
import { TFunction } from "i18next";
import { cancelTenantSubscription } from "@/utils/services/server/subscriptionService";

export async function deleteAndCancelTenant({ tenantId, userId, t }: { tenantId: string; userId: string; t?: TFunction }) {
  const tenantSubscription = await db.tenantSubscriptions.getTenantSubscription(tenantId);
  await cancelAllTenantPlans({ t, tenantId, userId });
  if (tenantSubscription?.stripeCustomerId) {
    await deleteStripeCustomer(tenantSubscription?.stripeCustomerId);
  }
  return await db.tenants.deleteTenant(tenantId);
}

export async function cancelAllTenantPlans({ tenantId, userId, t }: { tenantId: string; userId: string; t?: TFunction }) {
  const tenantSubscription = await db.tenantSubscriptions.getTenantSubscription(tenantId);
  if (tenantSubscription?.products) {
    await Promise.all(
      tenantSubscription.products.map(async (tenantSubscriptionProduct) => {
        await cancelTenantSubscription(tenantSubscriptionProduct.id, {
          tenantId,
          userId,
          t,
        });
      })
    );
  }
}

export async function getAvailableTenantSlug({ name, slug }: { name: string; slug?: string }) {
  if (slug === undefined) {
    slug = UrlUtils.slugify(name);
  }
  let tries = 1;
  do {
    const existingSlug = await getExistingSlug(slug);
    if (existingSlug) {
      slug = UrlUtils.slugify(name) + tries.toString();
      tries++;
    } else {
      break;
    }
  } while (true);
  return slug;
}

export async function getExistingSlug(slug: string) {
  if (["new-account", "undefined", "null"].includes(slug)) {
    return true;
  }
  const existing = await prisma.tenant.count({
    where: {
      slug,
    },
  });
  return existing > 0;
}
