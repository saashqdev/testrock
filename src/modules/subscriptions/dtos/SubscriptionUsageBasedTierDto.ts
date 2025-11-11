export interface SubscriptionUsageBasedTierDto {
  id: string;
  subscriptionUsageBasedPriceId: string;
  from: number;
  to?: number | null;
  perUnitPrice?: number | null;
  flatFeePrice?: number | null;
}
