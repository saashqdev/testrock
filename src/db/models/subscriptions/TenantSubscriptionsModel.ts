import { TenantSubscription } from "@prisma/client";
import { TenantSubscriptionProductWithDetailsDto } from "@/db/models/subscriptions/TenantSubscriptionProductsModel";

export type TenantSubscriptionWithDetailsDto = TenantSubscription & {
  products: TenantSubscriptionProductWithDetailsDto[];
};
