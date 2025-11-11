import { FiltersDto } from "@/lib/dtos/data/FiltersDto";
import { PaginationDto } from "@/lib/dtos/PaginationDto";
import { TenantSubscriptionProductWithTenantDto } from "@/db/models/subscriptions/TenantSubscriptionProductsModel";

export interface ITenantSubscriptionProductsDb {
  getAllTenantSubscriptionProducts(
    filters?: FiltersDto | undefined,
    pagination?: {
      page: number;
      pageSize: number;
    }
  ): Promise<{
    items: TenantSubscriptionProductWithTenantDto[];
    pagination: PaginationDto;
  }>;
  getTenantSubscriptionProduct(tenantId: string, subscriptionProductId: string): Promise<TenantSubscriptionProductWithTenantDto | null>;
  getTenantSubscriptionProductById(id: string): Promise<TenantSubscriptionProductWithTenantDto | null>;
  getTenantSubscriptionProductByStripeSubscriptionId(stripeSubscriptionId: string): Promise<TenantSubscriptionProductWithTenantDto | null>;
  addTenantSubscriptionProduct(data: {
    tenantSubscriptionId: string;
    subscriptionProductId: string;
    stripeSubscriptionId?: string | undefined;
    quantity?: number | undefined;
    fromCheckoutSessionId?: string | null | undefined;
    prices: {
      subscriptionPriceId?: string | undefined;
      subscriptionUsageBasedPriceId?: string | undefined;
    }[];
  }): Promise<
    {
      tenantSubscription: {
        id: string;
        tenantId: string;
        stripeCustomerId: string | null;
      };
    } & {
      id: string;
      createdAt: Date;
      tenantSubscriptionId: string;
      subscriptionProductId: string;
      cancelledAt: Date | null;
      endsAt: Date | null;
      currentPeriodEnd: Date | null;
    }
  >;
  updateTenantSubscriptionProduct(
    id: string,
    data: {
      quantity?: number | undefined;
      cancelledAt?: Date | null | undefined;
      endsAt?: Date | null | undefined;
      currentPeriodStart?: Date | null | undefined;
      currentPeriodEnd?: Date | null | undefined;
    }
  ): Promise<
    {
      tenantSubscription: {
        id: string;
        tenantId: string;
        stripeCustomerId: string | null;
      };
    } & {
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
    }
  >;
  cancelTenantSubscriptionProduct(
    id: string,
    data: {
      cancelledAt: Date | null;
      endsAt: Date | null;
    }
  ): Promise<void>;
}
