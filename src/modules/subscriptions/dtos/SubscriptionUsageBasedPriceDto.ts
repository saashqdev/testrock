import { SubscriptionBillingPeriod } from "@/modules/subscriptions/enums/SubscriptionBillingPeriod";
import { SubscriptionUsageBasedTierDto } from "./SubscriptionUsageBasedTierDto";

export interface SubscriptionUsageBasedPriceDto {
  id: string;
  subscriptionProductId: string;
  stripeId: string;
  billingPeriod: SubscriptionBillingPeriod;
  currency: string;
  unit: string;
  unitTitle: string;
  unitTitlePlural: string;
  usageType: string;
  aggregateUsage: string;
  tiersMode: string;
  billingScheme: string;
  tiers: SubscriptionUsageBasedTierDto[];
}
