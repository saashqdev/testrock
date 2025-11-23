"use client";

import { SubscriptionBillingPeriod } from "@/modules/subscriptions/enums/SubscriptionBillingPeriod";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { SubscriptionProductDto } from "@/modules/subscriptions/dtos/SubscriptionProductDto";
import Plan from "./Plan";
import ToggleBillingPeriod from "./ToggleBillingPeriod";
import CurrencyToggle from "@/components/ui/toggles/CurrencyToggle";
import { PricingModel } from "@/modules/subscriptions/enums/PricingModel";
import PricingUtils from "@/modules/subscriptions/utils/PricingUtils";
import { SubscriptionPriceDto } from "@/modules/subscriptions/dtos/SubscriptionPriceDto";
import Stripe from "stripe";
import { TenantSubscriptionWithDetailsDto } from "@/db/models";
import { IServerAction } from "@/lib/dtos/ServerComponentsProps";

interface Props {
  items: SubscriptionProductDto[];
  tenantSubscription?: TenantSubscriptionWithDetailsDto | null;
  canSubmit?: boolean;
  className?: string;
  stripeCoupon: Stripe.Coupon | null;
  initialCurrency: string;
  availableCurrencies: string[];
  initialBillingPeriod: SubscriptionBillingPeriod;
  availableBillingPeriods: SubscriptionBillingPeriod[];
  onClickFeature?: (name: string) => void;
  serverAction: IServerAction | null;
}
export default function Plans({
  items,
  tenantSubscription,
  canSubmit,
  className,
  stripeCoupon,
  initialCurrency,
  availableCurrencies,
  initialBillingPeriod,
  availableBillingPeriods,
  onClickFeature,
  serverAction,
}: Props) {
  const [products] = useState(items);
  // Use initial values only - no reactive dependency on props
  const [currency, setCurrency] = useState(initialCurrency);
  const [billingPeriod, setBillingPeriod] = useState<SubscriptionBillingPeriod>(initialBillingPeriod);

  useEffect(() => {
    // Disable scroll restoration
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  function getRecurringPrices() {
    let prices: SubscriptionPriceDto[] = [];
    products
      .filter((f) => f.model !== PricingModel.ONCE)
      .forEach((product) => {
        const recurringPrices = product.prices;
        prices = prices.concat(recurringPrices);
      });
    return prices;
  }

  function alreadyOwned(plan: SubscriptionProductDto) {
    const found = tenantSubscription?.products.find((f) => f.subscriptionProductId === plan.id);
    if (found) {
      return true;
    }
    return false;
  }

  function checkUpgradeDowngrade(plan: SubscriptionProductDto) {
    const existing = tenantSubscription?.products.find((f) => f)?.subscriptionProduct;
    if (existing) {
      if (plan.order > existing.order) {
        return { upgrade: true };
      } else {
        return { downgrade: true };
      }
    }
  }

  return (
    <div className={clsx(className, items.length === 1 && "mx-auto max-w-2xl")}>
      <div className="flex items-center justify-between">
        <div>
          <CurrencyToggle
            value={currency}
            onChange={(e) => {
              const newCurrency = typeof e === "function" ? e(currency) : e;
              setCurrency(newCurrency);
            }}
            possibleCurrencies={availableCurrencies}
            darkMode
          />
        </div>
        <div>
          <ToggleBillingPeriod
            size="sm"
            billingPeriod={billingPeriod}
            onChange={(e) => {
              setBillingPeriod(e);
            }}
            yearlyDiscount={PricingUtils.getYearlyDiscount(getRecurringPrices(), currency)}
            possibleBillingPeriods={availableBillingPeriods}
            darkMode
          />
        </div>
      </div>
      <div
        className={clsx(
          "grid gap-6 lg:gap-3",
          items.length === 2 && "lg:grid-cols-2 xl:grid-cols-2",
          items.length === 3 && "lg:grid-cols-3 xl:grid-cols-3",
          items.length === 4 && "lg:grid-cols-4 xl:grid-cols-4",
          items.length === 5 && "lg:grid-cols-4 xl:grid-cols-4",
          items.length === 6 && "lg:grid-cols-3 xl:grid-cols-3",
          items.length === 7 && "lg:grid-cols-3 xl:grid-cols-3",
          items.length >= 8 && "lg:grid-cols-3 xl:grid-cols-3"
        )}
      >
        {products.map((plan, index) => {
          return (
            <Plan
              key={index}
              className={clsx((products.length === 1 || (products.length === 4 && index === 3)) && "lg:col-span-1")}
              product={plan}
              title={plan.title}
              description={plan.description ?? undefined}
              badge={plan.badge ?? undefined}
              features={plan.features}
              billingPeriod={billingPeriod}
              currency={currency}
              prices={plan.prices}
              model={plan.model}
              usageBasedPrices={plan.usageBasedPrices}
              alreadyOwned={alreadyOwned(plan)}
              // tenantSubscription={tenantSubscription}
              canSubmit={canSubmit}
              isUpgrade={checkUpgradeDowngrade(plan)?.upgrade}
              isDowngrade={checkUpgradeDowngrade(plan)?.downgrade}
              stripeCoupon={stripeCoupon}
              onClickFeature={onClickFeature}
              serverAction={serverAction}
            />
          );
        })}
      </div>
    </div>
  );
}
