import { Tenant, Entity, Role } from "@prisma/client";
import { SubscriptionProductDto } from "@/lib/dtos/subscriptions/SubscriptionProductDto";
import { UserDto } from "@/db/models/accounts/UsersModel";

export interface OnboardingFilterMetadataDto {
  users: UserDto[];
  tenants: Tenant[];
  entities: Entity[];
  subscriptionProducts: SubscriptionProductDto[];
  roles: Role[];
}
