import { SubscriptionPriceDto } from "@/modules/subscriptions/dtos/SubscriptionPriceDto";
import { SubscriptionFeatureDto } from "@/modules/subscriptions/dtos/SubscriptionFeatureDto";
import { PricingModel } from "@/modules/subscriptions/enums/PricingModel";
import { SubscriptionUsageBasedPriceDto } from "@/modules/subscriptions/dtos/SubscriptionUsageBasedPriceDto";
import { TenantSubscriptionProductsModel } from "@/db/models";

export interface SubscriptionProductDto {
  id: string;
  stripeId: string;
  order: number;
  title: string;
  description: string | null;
  groupTitle?: string | null;
  groupDescription?: string | null;
  badge: string | null;
  active: boolean;
  model: PricingModel;
  public: boolean;
  prices: SubscriptionPriceDto[];
  features: SubscriptionFeatureDto[];
  translatedTitle?: string;
  usageBasedPrices?: SubscriptionUsageBasedPriceDto[];
  tenantProducts?: TenantSubscriptionProductsModel[];
  billingAddressCollection?: string | null;
  hasQuantity?: boolean;
  canBuyAgain?: boolean;
}
