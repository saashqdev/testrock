import { PortalUserSubscription } from "@prisma/client";
import { PortalUserSubscriptionProductWithDetailsDto } from "@/db/models/portals/PortalUserSubscriptionProductsModel";

export type PortalUserSubscriptionsModel = {
  id: string;
  userId: string;
  productId: string;
  status: "active" | "canceled" | "paused";
};

export type PortalUserSubscriptionWithDetailsDto = PortalUserSubscription & {
  products: PortalUserSubscriptionProductWithDetailsDto[];
};
