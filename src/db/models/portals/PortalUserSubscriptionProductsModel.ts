import {
  PortalSubscriptionFeature,
  PortalUserSubscriptionProduct,
  PortalSubscriptionProduct,
  PortalUserSubscriptionProductPrice,
  PortalSubscriptionPrice,
  PortalUserSubscription,
} from "@prisma/client";

export type PortalUserSubscriptionProductsModel = {
  id: number;
  portalUserSubscriptionId: number;
  productId: number;
  quantity: number;
};

export type PortalUserSubscriptionProductWithDetailsDto = PortalUserSubscriptionProduct & {
  subscriptionProduct: PortalSubscriptionProduct & { features: PortalSubscriptionFeature[] };
  prices: (PortalUserSubscriptionProductPrice & {
    subscriptionPrice: PortalSubscriptionPrice | null;
  })[];
};

export type PortalUserSubscriptionProductWithTenantDto = PortalUserSubscriptionProductWithDetailsDto & {
  portalUserSubscription: PortalUserSubscription & {
    portalUser: { id: string; email: string };
  };
};
