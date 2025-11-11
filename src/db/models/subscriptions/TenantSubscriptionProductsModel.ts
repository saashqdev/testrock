import {
  TenantSubscriptionProduct,
  SubscriptionProduct,
  SubscriptionFeature,
  TenantSubscriptionProductPrice,
  SubscriptionPrice,
  SubscriptionUsageBasedPrice,
  SubscriptionUsageBasedTier,
  TenantSubscription,
} from "@prisma/client";
import { TenantDto } from "@/db/models/accounts/TenantsModel";

export type TenantSubscriptionProductsModel = {
  id: string;
  createdAt: Date;
  tenantSubscriptionId: string;
  subscriptionProductId: string;
  cancelledAt: Date | null;
  endsAt: Date | null;
  stripeSubscriptionId: string | null;
  quantity: number | null;
  fromCheckoutSessionId: string | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
};

export type TenantSubscriptionProductWithDetailsDto = TenantSubscriptionProduct & {
  subscriptionProduct: SubscriptionProduct & { features: SubscriptionFeature[] };
  prices: (TenantSubscriptionProductPrice & {
    subscriptionPrice: SubscriptionPrice | null;
    subscriptionUsageBasedPrice: (SubscriptionUsageBasedPrice & { tiers: SubscriptionUsageBasedTier[] }) | null;
  })[];
};

export type TenantSubscriptionProductWithTenantDto = TenantSubscriptionProductWithDetailsDto & {
  tenantSubscription: TenantSubscription & { tenant: TenantDto };
};
