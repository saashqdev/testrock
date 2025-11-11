export type SubscriptionPriceModel = {
  id: string;
  subscriptionProductId: string;
  stripeId: string;
  type: number;
  billingPeriod: number;
  price: number;
  currency: string;
  trialDays: number;
  active: boolean;
};
