import { SubscriptionBillingPeriod } from "@/lib/enums/subscriptions/SubscriptionBillingPeriod";

export interface BillingPeriodDto {
  value: SubscriptionBillingPeriod;
  default?: boolean;
  disabled?: boolean;
  recurring: boolean;
}
