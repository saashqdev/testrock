import { TenantSubscriptionProductsModel } from "@/db/models";

export interface ITenantSubscriptionProductDb {
  get(id: string): Promise<TenantSubscriptionProductsModel | null>;

  getByStripeSubscriptionId(stripeSubscriptionId: string): Promise<TenantSubscriptionProductsModel | null>;

  create(data: {
    tenantSubscriptionId: string;
    subscriptionProductId: string;
    stripeSubscriptionId?: string;
    quantity?: number;
    fromCheckoutSessionId?: string | null;
    prices: {
      subscriptionPriceId?: string;
      subscriptionUsageBasedPriceId?: string;
    }[];
  }): Promise<string>;

  update(
    id: string,
    data: {
      cancelledAt?: Date | null;
      endsAt?: Date | null;
      currentPeriodStart?: Date | null;
      currentPeriodEnd?: Date | null;
    }
  ): Promise<void>;
}
