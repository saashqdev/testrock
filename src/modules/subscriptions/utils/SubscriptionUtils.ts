import { TFunction } from "i18next";
import { SubscriptionBillingPeriod } from "@/modules/subscriptions/enums/SubscriptionBillingPeriod";

function getBillingPeriodDescription(t: TFunction, billingPeriod: SubscriptionBillingPeriod) {
  return t("pricing." + SubscriptionBillingPeriod[billingPeriod].toString()).toString();
}

export default {
  getBillingPeriodDescription,
};
