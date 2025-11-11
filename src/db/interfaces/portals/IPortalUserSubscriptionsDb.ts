import { PortalUserSubscriptionWithDetailsDto } from "@/db/models/portals/PortalUserSubscriptionsModel";

export interface IPortalUserSubscriptionsDb {
  getOrPersistPortalUserSubscription(portalId: string, portalUserId: string): Promise<PortalUserSubscriptionWithDetailsDto>;
  getPortalUserSubscription(portalId: string, portalUserId: string): Promise<PortalUserSubscriptionWithDetailsDto | null>;
  getPortalUserSubscriptions(portalId: string): Promise<PortalUserSubscriptionWithDetailsDto[]>;
  createPortalUserSubscription(portalId: string, portalUserId: string, productId: string): Promise<PortalUserSubscriptionWithDetailsDto>;
  updatePortalUserSubscriptionCustomerId(
    portalId: string,
    portalUserId: string,
    data: {
      stripeCustomerId: string;
    }
  ): Promise<{
    id: string;
    portalId: string;
    portalUserId: string;
    stripeCustomerId: string | null;
  }>;
}
