import { FiltersDto } from "@/lib/dtos/data/FiltersDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { PortalUserSubscriptionProductWithTenantDto } from "@/db/models/portals/PortalUserSubscriptionProductsModel";

export interface IPortalUserSubscriptionProductsDb {
  getAllPortalUserSubscriptionProducts(
    portalId: string,
    filters?: FiltersDto | undefined,
    pagination?: {
      page: number;
      pageSize: number;
    }
  ): Promise<{
    items: PortalUserSubscriptionProductWithTenantDto[];
    pagination: PaginationDto;
  }>;
  getPortalUserSubscriptionProduct(
    portalId: string,
    portalUserId: string,
    subscriptionProductId: string
  ): Promise<PortalUserSubscriptionProductWithTenantDto | null>;
  getPortalUserSubscriptionProductById(portalId: string, id: string): Promise<PortalUserSubscriptionProductWithTenantDto | null>;
  getPortalUserSubscriptionProductByStripeSubscriptionId(
    portalId: string,
    stripeSubscriptionId: string
  ): Promise<PortalUserSubscriptionProductWithTenantDto | null>;
  addPortalUserSubscriptionProduct(data: {
    portalId: string;
    portalUserSubscriptionId: string;
    subscriptionProductId: string;
    stripeSubscriptionId?: string | undefined;
    quantity?: number | undefined;
    fromCheckoutSessionId?: string | null | undefined;
    prices: {
      subscriptionPriceId?: string | undefined;
    }[];
  }): Promise<
    {
      portalUserSubscription: {
        id: string;
        portalId: string;
        portalUserId: string;
        stripeCustomerId: string | null;
      };
    } & {
      id: string;
      portalId: string;
      createdAt: Date;
      portalUserSubscriptionId: string;
      subscriptionProductId: string;
      cancelledAt: Date | null;
      endsAt: Date | null;
      currentPeriodEnd: Date | null;
    }
  >;
  updatePortalUserSubscriptionProduct(
    portalId: string,
    id: string,
    data: {
      quantity?: number | undefined;
      cancelledAt?: Date | null | undefined;
      endsAt?: Date | null | undefined;
    }
  ): Promise<
    {
      portalUserSubscription: {
        id: string;
        portalId: string;
        portalUserId: string;
        stripeCustomerId: string | null;
      };
    } & {
      id: string;
      portalId: string;
      createdAt: Date;
      portalUserSubscriptionId: string;
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
  cancelPortalUserSubscriptionProduct(
    portalId: string,
    id: string,
    data: {
      cancelledAt: Date | null;
      endsAt: Date | null;
    }
  ): Promise<void>;
}
