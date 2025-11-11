export type TenantSubscriptionProductPriceModel = {
  id: string;
  tenantSubscriptionProductId: string;
  subscriptionPriceId: string | null;
  subscriptionUsageBasedPriceId: string | null;
};
