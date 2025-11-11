import { SubscriptionFeatureDto } from "@/modules/subscriptions/dtos/SubscriptionFeatureDto";
import { SubscriptionBillingPeriod } from "@/modules/subscriptions/enums/SubscriptionBillingPeriod";
import { SubscriptionPriceType } from "@/modules/subscriptions/enums/SubscriptionPriceType";
import { SubscriptionProductDto } from "../dtos/SubscriptionProductDto";
import { stripeService } from "./StripeService";
import Stripe from "stripe";
import { updateTenantSubscription } from "./TenantSubscriptionService";
import { getTenant } from "@/modules/accounts/services/TenantService";
import { SubscriptionUsageBasedPriceDto } from "@/modules/subscriptions/dtos/SubscriptionUsageBasedPriceDto";
import { TFunction } from "i18next";
import { SubscriptionPriceDto } from "@/modules/subscriptions/dtos/SubscriptionPriceDto";
import { clearSubscriptionsCache } from "./SubscriptionService";
import currencies from "@/modules/subscriptions/data/currencies";
import { getOrPersistTenantSubscription } from "./TenantSubscriptionService";
import { db } from "@/db";
import { CheckoutSessionStatusModel, SubscriptionPriceModel, SubscriptionUsageBasedPriceModel } from "@/db/models";

export async function createPlans(plans: SubscriptionProductDto[]) {
  let idx = 0;
  for (const plan of plans.sort((a, b) => a.order - b.order)) {
    // wait 5 seconds between each plan creation
    await createPlan(
      plan,
      plan.prices.map((price) => {
        return {
          billingPeriod: price.billingPeriod,
          currency: price.currency,
          price: Number(price.price),
        };
      }),
      plan.features,
      plan.usageBasedPrices
    );
    idx++;
    if (idx < plans.length) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

export async function createPlan(
  plan: SubscriptionProductDto,
  prices: { billingPeriod: SubscriptionBillingPeriod; price: number; currency: string; trialDays?: number }[],
  features: SubscriptionFeatureDto[],
  usageBasedPrices?: SubscriptionUsageBasedPriceDto[],
  t?: TFunction
) {
  // Create stripe product
  const stripeProduct = await stripeService.createStripeProduct({ title: plan.translatedTitle ?? plan.title });
  // Save to db
  const productId = await db.subscriptionProducts.createSubscriptionProduct({
    stripeId: stripeProduct?.id ?? "",
    order: plan.order,
    title: plan.title,
    model: plan.model,
    description: plan.description ?? undefined,
    badge: plan.badge ?? undefined,
    groupTitle: plan.groupTitle ?? undefined,
    groupDescription: plan.groupDescription ?? undefined,
    active: plan.active,
    public: plan.public,
    billingAddressCollection: plan.billingAddressCollection ?? "auto",
    hasQuantity: plan.hasQuantity ?? false,
    canBuyAgain: plan.canBuyAgain ?? false,
  });
  const product = await db.subscriptionProducts.getSubscriptionProduct(productId.id);

  if (!product) {
    throw new Error("Could not create subscription product");
  }

  await Promise.all(
    prices.map(async (price) => {
      // Create stripe price
      const stripePrice = await stripeService.createStripePrice(stripeProduct?.id ?? "", price);
      // Save to db
      return await db.subscriptionProducts.createSubscriptionPrice({
        ...price,
        subscriptionProductId: product.id!,
        stripeId: stripePrice?.id ?? "",
        type: SubscriptionPriceType.RECURRING,
        billingPeriod: price.billingPeriod,
        price: price.price,
        currency: price.currency,
        trialDays: price.trialDays ?? 0,
        active: true,
      });
    })
  );

  await Promise.all(
    features
      .sort((a, b) => a.order - b.order)
      .map(async (feature) => {
        // Save to db
        return await db.subscriptionFeature.create(product.id!, feature);
      })
  );

  if (usageBasedPrices) {
    await Promise.all(
      usageBasedPrices.map(async (usageBasedPrice) => {
        // eslint-disable-next-line no-console
        console.log("CREATING USAGE BASED PRICE", usageBasedPrice);
        const stripePrice = await stripeService.createStripeUsageBasedPrice(stripeProduct?.id ?? "", {
          ...usageBasedPrice,
          unitTitle: t ? t(usageBasedPrice.unitTitle) : usageBasedPrice.unitTitle,
        });
        const createdPriceId = await db.subscriptionProducts.createSubscriptionUsageBasedPrice({
          subscriptionProductId: product.id!,
          stripeId: stripePrice?.id ?? "",
          billingPeriod: usageBasedPrice.billingPeriod,
          currency: usageBasedPrice.currency,
          unit: usageBasedPrice.unit,
          unitTitle: usageBasedPrice.unitTitle,
          unitTitlePlural: usageBasedPrice.unitTitlePlural,
          usageType: usageBasedPrice.usageType,
          aggregateUsage: usageBasedPrice.aggregateUsage,
          tiersMode: usageBasedPrice.tiersMode,
          billingScheme: usageBasedPrice.billingScheme,
        });
        const createdPrice = await db.subscriptionProducts.createSubscriptionUsageBasedPrice(createdPriceId);
        if (!createdPrice) {
          throw new Error("Could not create usage based price");
        }
        await Promise.all(
          usageBasedPrice.tiers.map(async (tierPrice) => {
            await db.subscriptionProducts.createSubscriptionUsageBasedTier({
              subscriptionUsageBasedPriceId: createdPrice.id,
              from: tierPrice.from,
              to: tierPrice.to !== null && tierPrice.to !== undefined ? Number(tierPrice.to) : undefined,
              perUnitPrice: tierPrice.perUnitPrice !== null && tierPrice.perUnitPrice !== undefined ? tierPrice.perUnitPrice : undefined,
              flatFeePrice: tierPrice.flatFeePrice !== null && tierPrice.flatFeePrice !== undefined ? tierPrice.flatFeePrice : undefined,
            });
          })
        );
      })
    );
  }
}

export async function syncPlan(
  plan: SubscriptionProductDto,
  prices: { id?: string; billingPeriod: SubscriptionBillingPeriod; price: number; currency: string }[]
) {
  if (!plan.id) {
    throw new Error(`Plan ${plan.title} not found on database`);
  }
  const stripeProduct = await stripeService.createStripeProduct({ title: plan.translatedTitle ?? plan.title });
  if (!stripeProduct) {
    throw new Error("Could not create product");
  }
  await db.subscriptionProducts.updateSubscriptionProductStripeId(plan.id, {
    stripeId: stripeProduct.id,
  });

  prices.map(async (price) => {
    // Create stripe price
    const stripePrice = await stripeService.createStripePrice(stripeProduct?.id ?? "", price);
    if (!stripePrice) {
      throw new Error(`Could not create price ${plan.title} - ${price.price}`);
    }
    // Save to db
    await db.subscriptionProducts.updateSubscriptionPriceStripeId(price.id ?? "", {
      stripeId: stripePrice?.id ?? "",
    });
  });
}

export async function updatePlan(plan: SubscriptionProductDto, features: SubscriptionFeatureDto[]) {
  if (!plan.id) {
    throw new Error(`Plan ${plan.title} not found on database`);
  }

  await stripeService.updateStripeProduct(plan.stripeId, { title: plan.translatedTitle ?? plan.title });

  await db.subscriptionProducts.updateSubscriptionProduct(plan.id, {
    order: plan.order,
    title: plan.title,
    model: plan.model,
    description: plan.description ?? undefined,
    badge: plan.badge ?? undefined,
    groupTitle: plan.groupTitle ?? undefined,
    groupDescription: plan.groupDescription ?? undefined,
    public: plan.public,
    billingAddressCollection: plan.billingAddressCollection ?? "auto",
    hasQuantity: plan.hasQuantity === undefined ? undefined : plan.hasQuantity,
    canBuyAgain: plan.canBuyAgain === undefined ? undefined : plan.canBuyAgain,
  });

  await db.subscriptionFeature.deleteBySubscriptionProductId(plan.id ?? "");
  await clearSubscriptionsCache();

  return await Promise.all(
    features
      .sort((a, b) => a.order - b.order)
      .map(async (feature) => {
        return await db.subscriptionFeature.create(plan.id ?? "", feature);
      })
  );
}

export async function deletePlan(plan: SubscriptionProductDto) {
  await clearSubscriptionsCache();
  // eslint-disable-next-line no-console
  console.log(`Deleting ${plan.prices?.length} Flat-rate Prices`);

  await Promise.all(
    plan.prices
      .filter((f) => f.stripeId)
      .map(async (price) => {
        await stripeService.archiveStripePrice(price.stripeId);

        if (price.id) {
          await db.subscriptionProducts.deleteSubscriptionPrice(price.id);
        }

        return null;
      })
  );

  // eslint-disable-next-line no-console
  console.log(`Deleting ${plan.usageBasedPrices?.length ?? 0} Usage-based Prices`);
  if (plan.usageBasedPrices) {
    await Promise.all(
      plan.usageBasedPrices?.map(async (price) => {
        await stripeService.archiveStripePrice(price.stripeId);

        await Promise.all(
          price.tiers.map(async (tier) => {
            return db.subscriptionProducts.deleteSubscriptionUsageBasedTier(tier.id);
          })
        );
        await db.subscriptionProducts.deleteSubscriptionUsageBasedPrice(price.id);

        return null;
      })
    );
  }

  // eslint-disable-next-line no-console
  console.log("Deleting Product with Stripe ID: " + plan.stripeId);
  if (plan.stripeId) {
    try {
      await stripeService.deleteStripeProduct(plan.stripeId);
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error(e.message);
      await stripeService.archiveStripeProduct(plan.stripeId);
    }
  }

  if (plan.id) {
    await db.subscriptionProducts.deleteSubscriptionProduct(plan.id);
  }
}

export type CheckoutSessionResponse = {
  id: string;
  customer: {
    id: string;
    email: string;
    name: string;
  };
  products: {
    id: string;
    title: string;
    quantity: number;
    subscription: string | undefined;
    prices: { flatPrice?: SubscriptionPriceModel; usageBasedPrice?: SubscriptionUsageBasedPriceModel; quantity?: number }[];
  }[];
  status: CheckoutSessionStatusModel | null;
};
export async function getAcquiredItemsFromCheckoutSession(session_id: string | null): Promise<CheckoutSessionResponse | null> {
  const session = await stripeService.getStripeSession(session_id ?? "");
  if (!session || session.status !== "complete") {
    return null;
  }
  const prices: { flatPrice?: SubscriptionPriceModel; usageBasedPrice?: SubscriptionUsageBasedPriceModel; quantity?: number }[] = [];
  try {
    let line_items: { price: Stripe.Price; quantity: number | undefined }[] = [];
    if (session.line_items) {
      session.line_items.data.forEach((item) => {
        if (item.price) {
          line_items.push({
            price: item.price,
            quantity: item.quantity ?? undefined,
          });
        }
      });
    }

    await Promise.all(
      line_items.map(async (line_item) => {
        const flatPrice = await db.subscriptionProducts.getSubscriptionPriceByStripeId(line_item.price.id);
        const usageBasedPrice = await db.subscriptionProducts.getSubscriptionUsageBasedPriceByStripeId(line_item.price.id);
        const quantity = line_item.quantity ?? undefined;
        if (!flatPrice && !usageBasedPrice) {
          throw new Error("Price not found: " + line_item.price.id);
        }
        prices.push({
          flatPrice: flatPrice ?? undefined,
          usageBasedPrice: usageBasedPrice ?? undefined,
          quantity,
        });
      })
    );
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error(e.message);
  }

  const products: {
    id: string;
    title: string;
    quantity: number;
    subscription: string | undefined;
    prices: { flatPrice?: SubscriptionPriceModel; usageBasedPrice?: SubscriptionUsageBasedPriceModel; quantity?: number }[];
  }[] = [];

  prices.forEach((item) => {
    const productId = item.flatPrice?.subscriptionProductId ?? item.usageBasedPrice?.subscriptionProductId ?? "";
    if (!productId) {
      return;
    }
    const product = products.find((p) => p.id === productId);
    if (!product) {
      products.push({
        id: productId,
        title: "",
        quantity: item.quantity ?? 1,
        prices: [item],
        subscription: session.subscription?.toString(),
      });
    } else {
      product?.prices.push(item);
    }
  });

  await Promise.all(
    products.map(async (product) => {
      const subscriptionProduct = await db.subscriptionProducts.getSubscriptionProduct(product.id);
      product.title = subscriptionProduct?.title ?? "";
    })
  );

  const status = await db.checkoutSessionStatus.get(session.id);

  return {
    id: session.id,
    customer: {
      id: session.customer?.toString() ?? "",
      name: session.customer_details?.name ?? "",
      email: session.customer_details?.email ?? "",
    },
    products,
    status,
  };
}

export async function addTenantProductsFromCheckoutSession({
  tenantId,
  user,
  checkoutSession,
  createdUserId,
  createdTenantId,
  t,
}: {
  tenantId: string;
  user: { id: string; email: string };
  checkoutSession: CheckoutSessionResponse;
  createdUserId?: string | null;
  createdTenantId?: string | null;
  t: TFunction;
}) {
  await clearSubscriptionsCache();
  const tenant = await getTenant(tenantId);
  if (!tenant) {
    throw new Error("Tenant not found");
  }
  const tenantSubscription = await getOrPersistTenantSubscription(tenant.id);
  if (!tenantSubscription.stripeCustomerId) {
    const customer = await stripeService.createStripeCustomer(user.email, tenant.name);
    if (customer) {
      tenantSubscription.stripeCustomerId = customer.id;
      await updateTenantSubscription(tenant.id, {
        stripeCustomerId: customer.id,
      });
    }
  }
  const existingSessionStatus = await db.checkoutSessionStatus.get(checkoutSession.id);
  if (!checkoutSession) {
    throw new Error(t("settings.subscription.checkout.invalid"));
  } else if (checkoutSession.customer.id !== tenantSubscription.stripeCustomerId) {
    throw new Error(t("settings.subscription.checkout.invalidCustomer"));
  } else if (!existingSessionStatus) {
    throw new Error(t("settings.subscription.checkout.invalid"));
  } else if (!existingSessionStatus.pending) {
    throw new Error(t("settings.subscription.checkout.alreadyProcessed"));
  } else {
    await db.checkoutSessionStatus.update(checkoutSession.id, {
      pending: false,
      createdUserId,
      createdTenantId,
    });
    await Promise.all(
      checkoutSession.products.map(async (product) => {
        await db.tenantSubscriptionProducts.addTenantSubscriptionProduct({
          tenantSubscriptionId: tenantSubscription.id,
          subscriptionProductId: product.id ?? "",
          quantity: product.quantity,
          stripeSubscriptionId: product.subscription ?? "",
          fromCheckoutSessionId: checkoutSession.id,
          prices: product.prices.map((price) => {
            return {
              subscriptionPriceId: price.flatPrice?.id,
              subscriptionUsageBasedPriceId: price.usageBasedPrice?.id,
            };
          }),
        });
        const subscriptionProduct = await db.subscriptionProducts.getSubscriptionProduct(product.id);
        // eslint-disable-next-line no-console
        console.log("[addTenantProductsFromCheckoutSession] Subscription product", { subscriptionProduct });
      })
    );
  }
}

export async function autosubscribeToTrialOrFreePlan({ tenantId }: { tenantId: string }) {
  // eslint-disable-next-line no-console
  console.log("[autosubscribeToTrialOrFreePlan] Starting");
  const tenant = await getTenant(tenantId);
  if (!tenant) {
    // eslint-disable-next-line no-console
    console.log("[autosubscribeToTrialOrFreePlan] No tenant");
    return;
  }
  if (!tenant.subscription?.stripeCustomerId) {
    // eslint-disable-next-line no-console
    console.log("[autosubscribeToTrialOrFreePlan] No stripe customer id");
    return;
  }
  const defaultCurrency = currencies.find((f) => f.default)?.value;
  if (!defaultCurrency) {
    return;
  }
  const allProducts = await db.subscriptionProducts.getAllSubscriptionProducts(true);
  const productsFree: SubscriptionPriceDto[] = [];
  const productsWithTrialDays: SubscriptionPriceDto[] = [];

  // eslint-disable-next-line no-console
  console.log("[autosubscribeToTrialOrFreePlan] All products", { allProducts: allProducts.map((f) => f.title) });

  allProducts.forEach((product) => {
    if (product.prices.length === 0) {
      return;
    }
    const allPricesAreZero = product.prices.every((price) => price.currency === defaultCurrency && (price.price === undefined || Number(price.price) === 0));
    if (allPricesAreZero) {
      productsFree.push(product.prices[0]);
    }
    const firstPriceWithTrialDays = product.prices.find(
      (price) => price.currency === defaultCurrency && (price.trialDays > 0 || price.price === undefined || Number(price.price) === 0)
    );
    if (firstPriceWithTrialDays) {
      productsWithTrialDays.push(firstPriceWithTrialDays);
    }
  });

  try {
    if (productsWithTrialDays.length > 0) {
      // eslint-disable-next-line no-console
      console.log("[autosubscribeToTrialOrFreePlan] Products with trial days", { productsWithTrialDays });
      const price = productsWithTrialDays[0];
      // eslint-disable-next-line no-console
      console.log({ price });
      const trial_end = Math.floor(Date.now() / 1000) + (price.trialDays || 30) * 24 * 60 * 60;
      const stripeSubscription = await stripeService.createStripeSubscription(tenant.subscription.stripeCustomerId, price.stripeId, trial_end);
      await db.tenantSubscriptionProducts.addTenantSubscriptionProduct({
        tenantSubscriptionId: tenant.subscription.id,
        subscriptionProductId: price.subscriptionProductId,
        quantity: 1,
        stripeSubscriptionId: stripeSubscription.id,
        fromCheckoutSessionId: null,
        prices: [
          {
            subscriptionPriceId: price.id,
          },
        ],
      });
    } else if (productsFree.length > 0) {
      // TODO: IMPLEMENT
      // eslint-disable-next-line no-console
      console.log("[autosubscribeToTrialOrFreePlan] Products free", { productsFree });
    } else {
      // eslint-disable-next-line no-console
      console.log("[autosubscribeToTrialOrFreePlan] No auto-subscription products/plans found");
    }
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error("[autosubscribeToTrialOrFreePlan] Error", e.message);
  }
}
