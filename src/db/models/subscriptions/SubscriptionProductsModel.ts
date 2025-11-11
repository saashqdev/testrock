import { SubscriptionPrice, SubscriptionProduct, SubscriptionUsageBasedPrice } from "@prisma/client";

export type SubscriptionPriceWithProductDto = SubscriptionPrice & {
  subscriptionProduct: SubscriptionProduct;
};

export type SubscriptionUsageBasedPriceWithProductDto = SubscriptionUsageBasedPrice & {
  subscriptionProduct: SubscriptionProduct;
};
