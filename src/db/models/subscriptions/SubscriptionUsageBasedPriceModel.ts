export type SubscriptionUsageBasedPriceModel = {
  id: string;
  subscriptionProductId: string;
  stripeId: string;
  billingPeriod: number;
  currency: string;
  unit: string;
  unitTitle: string;
  unitTitlePlural: string;
  usageType: string;
  aggregateUsage: string;
  tiersMode: string;
  billingScheme: string;
};
