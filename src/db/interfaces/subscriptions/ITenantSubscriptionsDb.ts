import { TenantSubscriptionWithDetailsDto } from "@/db/models/subscriptions/TenantSubscriptionsModel";

export interface ITenantSubscriptionsDb {
  getOrPersistTenantSubscription(tenantId: string): Promise<TenantSubscriptionWithDetailsDto>;
  getTenantSubscription(tenantId: string): Promise<TenantSubscriptionWithDetailsDto | null>;
  getTenantSubscriptions(): Promise<TenantSubscriptionWithDetailsDto[]>;
  createTenantSubscription(
    tenantId: string,
    stripeCustomerId: string
  ): Promise<
    {
      products: ({
        subscriptionProduct: {
          features: {
            name: string;
            id: string;
            order: number;
            subscriptionProductId: string;
            title: string;
            badge: string | null;
            type: number;
            value: number;
            href: string | null;
            accumulate: boolean;
          }[];
        } & {
          id: string;
          order: number;
          stripeId: string;
          title: string;
          active: boolean;
          model: number;
          public: boolean;
          groupTitle: string | null;
          groupDescription: string | null;
          description: string | null;
          badge: string | null;
          billingAddressCollection: string;
          hasQuantity: boolean;
          canBuyAgain: boolean;
        };
        prices: ({} & {})[];
      } & {})[];
    } & {}
  >;
  updateTenantSubscriptionCustomerId(
    tenantId: string,
    data: {
      stripeCustomerId: string;
    }
  ): Promise<TenantSubscriptionWithDetailsDto>;
  createUsageRecord(data: { tenantSubscriptionProductPriceId: string; timestamp: number; quantity: number; stripeSubscriptionItemId: string }): Promise<string>;
}
