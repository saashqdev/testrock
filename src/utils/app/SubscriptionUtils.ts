import { TFunction } from "i18next";
import { SubscriptionBillingPeriod } from "@/lib/enums/subscriptions/SubscriptionBillingPeriod";
import { SubscriptionPriceWithProductDto } from "@/db/models/subscriptions/SubscriptionProductsModel";
import DateUtils from "@/lib/shared/DateUtils";
import NumberUtils from "@/lib/shared/NumberUtils";
import { TenantSubscriptionProductWithDetailsDto } from "@/db/models/subscriptions/TenantSubscriptionProductsModel";

function getProductTitle({ t, item }: { t: TFunction; item: TenantSubscriptionProductWithDetailsDto }) {
  let title =
    t(item.subscriptionProduct.title) +
    " " +
    item.prices
      .map(
        (f) => `$${NumberUtils.decimalFormat(Number(f.subscriptionPrice?.price ?? 0))} - ${getBillingPeriodDescription(t, f.subscriptionPrice!.billingPeriod)}`
      )
      .join(", ");
  if (item.endsAt) {
    title += ` (ends ${DateUtils.dateAgo(item.endsAt)})`;
  }
  return title;
}

function getPriceDescription(t: TFunction, item: SubscriptionPriceWithProductDto) {
  return `${t(item.subscriptionProduct.title)} - $${NumberUtils.decimalFormat(Number(item.price))} - ${getBillingPeriodDescription(t, item.billingPeriod)}`;
}

function getBillingPeriodDescription(t: TFunction, billingPeriod: SubscriptionBillingPeriod) {
  return t("pricing." + SubscriptionBillingPeriod[billingPeriod].toString()).toString();
}

export default {
  getProductTitle,
  getPriceDescription,
  getBillingPeriodDescription,
};
