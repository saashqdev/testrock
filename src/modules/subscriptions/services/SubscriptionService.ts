import { DefaultAppFeatures } from "@/modules/subscriptions/data/appFeatures";
import { PlanFeatureUsageDto } from "@/modules/subscriptions/dtos/PlanFeatureUsageDto";
import { SubscriptionFeatureDto } from "@/modules/subscriptions/dtos/SubscriptionFeatureDto";
import { SubscriptionBillingPeriod } from "@/modules/subscriptions/enums/SubscriptionBillingPeriod";
import { SubscriptionFeatureLimitType } from "@/modules/subscriptions/enums/SubscriptionFeatureLimitType";
import currencies from "@/modules/subscriptions/data/currencies";
import { stripeService } from "./StripeService";
import { getAcquiredItemsFromCheckoutSession } from "./PricingService";
import { cachified, clearCacheKey } from "@/lib/services/cache.server";
import DateUtils from "@/lib/utils/DateUtils";
import { PricingModel } from "../enums/PricingModel";
import { SubscriptionPriceDto } from "../dtos/SubscriptionPriceDto";
import { SubscriptionFeatureModel, SubscriptionPriceModel, TenantSubscriptionWithDetailsDto } from "@/db/models";
import { db } from "@/db";

export async function getPlanFeaturesUsage(tenantId: string, tenantSubscription?: TenantSubscriptionWithDetailsDto | null): Promise<PlanFeatureUsageDto[]> {
  let subscription: TenantSubscriptionWithDetailsDto | null = null;
  if (tenantSubscription === undefined) {
    subscription = await getActiveTenantSubscriptions(tenantId);
  } else {
    subscription = tenantSubscription;
  }
  const myUsage: PlanFeatureUsageDto[] = [];
  let allFeatures: SubscriptionFeatureDto[] = [];
  const features: SubscriptionFeatureModel[] = await db.subscriptionFeature.getAll();
  features
    .filter((f) => f.name)
    .forEach((feature) => {
      const existing = allFeatures.find((f) => f.name === feature.name);
      if (!existing) {
        allFeatures.push({
          id: feature.id,
          order: feature.order,
          name: feature.name,
          title: feature.title,
          type: feature.type,
          value: feature.value,
          accumulate: feature.accumulate,
        });
      }
    });
  allFeatures = allFeatures.sort((a, b) => a.order - b.order);

  await Promise.all(
    allFeatures.map(async (item) => {
      let myFeatures: SubscriptionFeatureDto[] = [];
      subscription?.products.forEach((product) => {
        const feature = product.subscriptionProduct.features.find((f) => f.name === item.name);
        if (feature) {
          if (!product.quantity) {
            myFeatures.push(feature);
          } else {
            // per-seat or one-time multiplication
            for (let idx = 0; idx < product.quantity; idx++) {
              myFeatures.push(feature);
            }
          }
        }
      });
      const existingSubscriptionFeature = mergeFeatures(myFeatures);
      const feature = existingSubscriptionFeature ?? item;
      const usage: PlanFeatureUsageDto = {
        order: feature.order,
        title: feature.title,
        name: feature.name,
        type: feature.type,
        value: feature.value,
        used: 0,
        remaining: 0,
        enabled: feature.type !== SubscriptionFeatureLimitType.NOT_INCLUDED,
        message: "",
      };

      if (!existingSubscriptionFeature) {
        usage.type = SubscriptionFeatureLimitType.NOT_INCLUDED;
        usage.enabled = false;
        if (subscription?.products && subscription.products.length > 0) {
          usage.message = "api.featureLimits.upgradeSubscription";
        } else {
          usage.message = "api.featureLimits.noSubscription";
        }
      } else {
        if (feature.type === SubscriptionFeatureLimitType.NOT_INCLUDED) {
          usage.enabled = false;
          usage.message = "api.featureLimits.notIncluded";
        } else if (feature.type === SubscriptionFeatureLimitType.MAX) {
          usage.used = await getUsed(tenantId, feature, subscription);
          usage.remaining = usage.value - usage.used;
          if (usage.remaining <= 0) {
            usage.message = `You've reached the limit (${usage.used}/${usage.value})`;
            usage.enabled = false;
          }
        } else if (feature.type === SubscriptionFeatureLimitType.MONTHLY) {
          usage.used = await getUsed(tenantId, feature, subscription);
          usage.remaining = usage.value - usage.used;
          usage.period = getUsedPeriod(subscription);
          if (usage.remaining <= 0) {
            usage.message = `You've reached the limit this month (${usage.used}/${usage.value})`;
            usage.enabled = false;
          }
        } else if (feature.type === SubscriptionFeatureLimitType.UNLIMITED) {
          usage.remaining = "unlimited";
        }
      }
      myUsage.push(usage);
    })
  );

  return myUsage.sort((a, b) => a.order - b.order);
}

function mergeFeatures(features: SubscriptionFeatureDto[]) {
  if (features.length === 0) {
    return undefined;
  }
  const mergedFeature: SubscriptionFeatureDto = {
    id: features[0].id,
    order: features[0].order,
    title: features[0].title,
    name: features[0].name,
    type: SubscriptionFeatureLimitType.NOT_INCLUDED,
    value: 0,
    accumulate: features[0].accumulate,
  };

  let firstFeature = true;
  features.forEach((feature) => {
    if (mergedFeature.type < feature.type) {
      mergedFeature.type = feature.type;
    }
    // console.log({ mergedFeature });
    if (mergedFeature.accumulate || firstFeature) {
      mergedFeature.value += feature.value;
    }

    firstFeature = false;
  });

  return mergedFeature;
}

export async function getPlanFeatureUsage(
  tenantId: string,
  featureName: string,
  tenantSubscription?: TenantSubscriptionWithDetailsDto | null
): Promise<PlanFeatureUsageDto | undefined> {
  const usage = await getPlanFeaturesUsage(tenantId, tenantSubscription);
  return usage.find((f) => f.name === featureName);
}

function getUsedPeriod(subscription: TenantSubscriptionWithDetailsDto | null) {
  const date = new Date(),
    y = date.getFullYear(),
    m = date.getMonth();
  let firstDay = new Date(y, m, 1, 0, 0, 1);
  let lastDay = new Date(y, m + 1, 0, 23, 59, 59);

  subscription?.products.forEach((product) => {
    if (product.currentPeriodStart && product.currentPeriodEnd) {
      firstDay = product.currentPeriodStart;
      lastDay = product.currentPeriodEnd;
    }
  });

  return {
    firstDay,
    lastDay,
  };
}

async function getUsed(tenantId: string, feature: SubscriptionFeatureDto, subscription: TenantSubscriptionWithDetailsDto | null): Promise<number> {
  const { firstDay, lastDay } = await getUsedPeriod(subscription);
  if (feature.name === DefaultAppFeatures.Users) {
    if (feature.type === SubscriptionFeatureLimitType.MONTHLY) {
      return await db.tenantUser.countByCreatedAt(tenantId, {
        gte: firstDay,
        lt: lastDay,
      });
    } else if (feature.type === SubscriptionFeatureLimitType.MAX) {
      return await db.tenantUser.count(tenantId);
    }
  } else if (feature.name === DefaultAppFeatures.Credits) {
    if (feature.type === SubscriptionFeatureLimitType.MONTHLY) {
      return await db.credits.sumAmount({
        tenantId,
        createdAt: { gte: firstDay, lt: lastDay },
      });
    } else if (feature.type === SubscriptionFeatureLimitType.MAX) {
      return await db.credits.sumAmount({ tenantId });
    }
  }
  return 0;
}

export async function getActiveTenantSubscriptions(tenantId: string) {
  const mySubscription = await cachified({
    key: `tenantSubscription:${tenantId}`,
    ttl: 1000 * 60 * 60, // 1 hour
    getFreshValue: () => db.tenantSubscriptions.getTenantSubscription(tenantId),
  });
  if (mySubscription) {
    await Promise.all(
      mySubscription.products.map(async (item) => {
        if (item.stripeSubscriptionId) {
          let currentPeriod =
            item.currentPeriodStart && item.currentPeriodEnd
              ? {
                  start: DateUtils.getDateStartOfDay(item.currentPeriodStart),
                  end: DateUtils.getDateEndOfDay(item.currentPeriodEnd),
                }
              : undefined;
          const today = new Date();
          let todayIsInCurrentPeriod = false;
          if (currentPeriod) {
            todayIsInCurrentPeriod = today >= item.currentPeriodStart! && today <= item.currentPeriodEnd!;
          }
          if (currentPeriod && todayIsInCurrentPeriod) {
            item.currentPeriodStart = currentPeriod.start;
            item.currentPeriodEnd = currentPeriod.end;
          } else {
            const stripeSubscription = await stripeService.getStripeSubscription(item.stripeSubscriptionId);
            if (stripeSubscription) {
              let startOfDay = new Date(stripeSubscription.current_period_start * 1000);
              let endOfDay = new Date(stripeSubscription.current_period_end * 1000);
              item.currentPeriodStart = DateUtils.getDateStartOfDay(startOfDay);
              item.currentPeriodEnd = DateUtils.getDateEndOfDay(endOfDay);
            }
            await db.tenantSubscriptionProducts
              .updateTenantSubscriptionProduct(item.id, {
                currentPeriodStart: item.currentPeriodStart,
                currentPeriodEnd: item.currentPeriodEnd,
              })
              .then(() => {
                clearCacheKey(`tenantSubscription:${tenantId}`);
              });
          }
        }
      })
    );
    mySubscription.products = mySubscription.products.filter((f) => !f.endsAt || new Date(f.endsAt) > new Date());
  }
  return mySubscription;
}

async function getActiveTenantsSubscriptions() {
  const subscriptions = await db.tenantSubscriptions.getTenantSubscriptions();
  return await Promise.all(
    subscriptions.map(async (mySubscription) => {
      await Promise.all(
        mySubscription.products.map(async (item) => {
          if (item.stripeSubscriptionId) {
            const stripeSubscription = await stripeService.getStripeSubscription(item.stripeSubscriptionId);
            if (stripeSubscription) {
              item.currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
              item.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
            }
          }
        })
      );
      mySubscription.products = mySubscription.products.filter((f) => !f.endsAt || new Date(f.endsAt) > new Date());
      return mySubscription;
    })
  );
}

export async function reportUsage(tenantId: string, unit: string) {
  const tenantSubscription = await getActiveTenantSubscriptions(tenantId);
  if (!tenantSubscription) {
    return;
  }
  await Promise.all(
    tenantSubscription.products.map(async (product) => {
      return await Promise.all(
        product.prices.map(async (price) => {
          if (!product.stripeSubscriptionId) {
            return;
          }
          if (price.subscriptionUsageBasedPrice?.unit === unit) {
            const stripeSubscription = await stripeService.getStripeSubscription(product.stripeSubscriptionId);
            const subscriptionItem = stripeSubscription?.items.data.find((f) => f.price.id === price.subscriptionUsageBasedPrice?.stripeId);
            if (subscriptionItem) {
              // console.log("[REPORT USAGE] Will report usage for subscription item id", subscriptionItem);
              const usageRecord = await stripeService.createUsageRecord(subscriptionItem.id, 1, "increment");
              if (usageRecord) {
                await db.tenantSubscriptions.createUsageRecord({
                  tenantSubscriptionProductPriceId: price.id,
                  timestamp: usageRecord.timestamp,
                  quantity: usageRecord.quantity,
                  stripeSubscriptionItemId: subscriptionItem.id,
                });
              }
            }
          }
        })
      );
    })
  );
}

export async function persistCheckoutSessionStatus({
  id,
  fromUrl,
  fromUserId,
  fromTenantId,
}: {
  id: string;
  fromUrl: string;
  fromUserId?: string | null;
  fromTenantId?: string | null;
}) {
  const existingCheckoutSession = await db.checkoutSessionStatus.get(id);
  if (!existingCheckoutSession) {
    const stripeCheckoutSession = await stripeService.getStripeSession(id);
    if (stripeCheckoutSession) {
      const sessionId = await db.checkoutSessionStatus.create({
        id: stripeCheckoutSession.id,
        email: stripeCheckoutSession.customer_details?.email ?? "",
        fromUrl,
        fromUserId,
        fromTenantId,
      });
      const session = await db.checkoutSessionStatus.get(sessionId);
      if (session && !session.fromUserId && !session.fromTenantId) {
        const sessionResponse = await getAcquiredItemsFromCheckoutSession(session.id);
        if (sessionResponse && sessionResponse.products.length > 0) {
          // await sendEmail({
          //   to: session.email,
          //   ...EmailTemplates.ACCOUNT_SETUP_EMAIL.parse({
          //     // plan: sessionResponse.products[0].title,
          //     appConfiguration,
          //     action_url: `${(await getBaseURL())}/pricing/${session.id}/success`,
          //   }),
          // });
        }
      }
    }
  }
}

export async function getMrr(currency: string) {
  const activeSubscriptions = await getActiveTenantsSubscriptions();
  let summary: { total: number; count: number } = {
    total: 0,
    count: 0,
  };
  activeSubscriptions.forEach((s) => {
    s.products.forEach((p) => {
      summary.count++;
      p.prices.forEach((f) => {
        summary.total += getPriceInCurrency(f.subscriptionPrice, currency);
      });
    });
  });
  return summary;
}

function getPriceInCurrency(subscriptionPrice: SubscriptionPriceModel | null, currency: string) {
  if (!subscriptionPrice) {
    return 0;
  }
  let total = 0;
  if (subscriptionPrice.billingPeriod === SubscriptionBillingPeriod.MONTHLY) {
    total = Number(subscriptionPrice.price);
  } else if (subscriptionPrice.billingPeriod === SubscriptionBillingPeriod.YEARLY) {
    total = Number(subscriptionPrice.price) / 12;
  } else if (subscriptionPrice.billingPeriod === SubscriptionBillingPeriod.WEEKLY) {
    total = Number(subscriptionPrice.price) * 4;
  } else if (subscriptionPrice.billingPeriod === SubscriptionBillingPeriod.DAILY) {
    total = Number(subscriptionPrice.price) * 30;
  }
  if (currency !== subscriptionPrice.currency) {
    total = convertToCurrency({ from: subscriptionPrice.currency, to: currency, price: total });
  }
  return total;
}

function convertToCurrency({ from, price, to }: { from: string; price: number; to: string }): number {
  const fromCurrency = currencies.find((f) => f.value === from);
  const toCurrency = currencies.find((f) => f.value === to);
  if (!fromCurrency || !toCurrency) {
    return 0;
  }
  const fromParity = fromCurrency.parities?.find((f) => f.from === to);
  const toParity = toCurrency.parities?.find((f) => f.from === from);
  if (fromParity && fromParity.parity !== 0) {
    return price / fromParity.parity;
  } else if (toParity && toParity.parity !== 0) {
    return price / toParity.parity;
  }
  return 0;
}

export async function clearSubscriptionsCache() {
  const tenants = await db.tenants.adminGetAllTenantsIdsAndNames();
  tenants.forEach((tenant) => {
    clearCacheKey(`tenantSubscription:${tenant.id}`);
  });
}

export async function getPlanFromForm(form: FormData) {
  const productId = form.get("product-id")?.toString() ?? "";
  const billingPeriod = Number(form.get("billing-period")) as SubscriptionBillingPeriod;
  const currency = form.get("currency")?.toString() ?? "";
  const quantity = Number(form.get("quantity"));
  const coupon = form.get("coupon")?.toString();
  const isUpgrade = form.get("is-upgrade")?.toString() === "true";
  const isDowngrade = form.get("is-downgrade")?.toString() === "true";
  const referral = form.get("referral")?.toString() || null;

  // eslint-disable-next-line no-console
  console.log("[Subscription]", {
    productId,
    billingPeriod: SubscriptionBillingPeriod[billingPeriod],
    currency,
    quantity,
    coupon,
    referral,
    isUpgrade,
    isDowngrade,
  });

  const product = await db.subscriptionProducts.getSubscriptionProduct(productId);
  if (!product) {
    throw Error("Invalid product");
  }

  let flatPrice: SubscriptionPriceDto | undefined = undefined;
  let freeTrialDays: number | undefined = undefined;
  if (product.model === PricingModel.ONCE) {
    flatPrice = product.prices.find((f) => f.currency === currency && f.billingPeriod === SubscriptionBillingPeriod.ONCE);
  } else {
    flatPrice = product.prices.find((f) => f.currency === currency && f.billingPeriod === billingPeriod);
  }
  const usageBasedPrices = product?.usageBasedPrices?.filter((f) => f.currency === currency);

  if (!flatPrice && usageBasedPrices?.length === 0) {
    throw Error("Invalid price");
  }
  let mode: "payment" | "setup" | "subscription" = "subscription";
  const line_items: { price: string; quantity?: number }[] = [];
  if (product.model === PricingModel.ONCE) {
    mode = "payment";
  }

  if (flatPrice) {
    line_items.push({ price: flatPrice.stripeId, quantity });
    if (flatPrice.trialDays > 0) {
      freeTrialDays = flatPrice.trialDays;
    }
  }
  usageBasedPrices?.forEach((usageBasedPrice) => {
    line_items.push({ price: usageBasedPrice.stripeId });
  });

  return {
    mode,
    line_items,
    product,
    flatPrice,
    usageBasedPrices,
    freeTrialDays,
    coupon,
    isUpgrade,
    isDowngrade,
    referral,
  };
}
