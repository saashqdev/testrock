import { PortalSubscriptionPrice, PortalSubscriptionProduct } from "@prisma/client";

export type PortalSubscriptionProductsModel = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  billingCycle: "monthly" | "yearly";
  isActive: boolean;
};

export type PortalSubscriptionPriceWithProductDto = PortalSubscriptionPrice & {
  subscriptionProduct: PortalSubscriptionProduct;
};
