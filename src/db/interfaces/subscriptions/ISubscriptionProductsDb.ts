import { Prisma } from "@prisma/client";
import { SubscriptionBillingPeriod } from "@/lib/enums/subscriptions/SubscriptionBillingPeriod";
import { SubscriptionFeatureLimitType } from "@/lib/enums/subscriptions/SubscriptionFeatureLimitType";
import { SubscriptionPriceType } from "@/lib/enums/subscriptions/SubscriptionPriceType";
import { SubscriptionPriceWithProductDto, SubscriptionUsageBasedPriceWithProductDto } from "@/db/models/subscriptions/SubscriptionProductsModel";
import { SubscriptionProduct, SubscriptionPrice, SubscriptionUsageBasedPrice, SubscriptionFeature } from "@prisma/client";
import { PricingModel } from "@/lib/enums/subscriptions/PricingModel";

export interface ISubscriptionProductsDb {
  getAllSubscriptionProductsWithTenants(): Promise<
    {
      id: string;
      stripeId: string;
      order: number;
      title: string;
      active: boolean;
      model: number;
      public: boolean;
      groupTitle: string | null;
      groupDescription: string | null;
      description: string | null;
      badge: string | null;
      billingAddressCollection: string;
      hasQuantity: boolean;
      canBuyAgain: boolean;
    }[]
  >;
  getAllSubscriptionProducts(isPublic?: boolean | undefined): Promise<
    {
      id: string;
      stripeId: string;
      order: number;
      title: string;
      active: boolean;
      model: number;
      public: boolean;
      groupTitle: string | null;
      groupDescription: string | null;
      description: string | null;
      badge: string | null;
      billingAddressCollection: string;
      hasQuantity: boolean;
      canBuyAgain: boolean;
      tenantProducts: any[];
      usageBasedPrices: any[];
      prices: any[];
      assignsTenantTypes?: any[];
      features: any[];
    }[]
  >;
  getSubscriptionProductsInIds(ids: string[]): Promise<
    {
      id: string;
      stripeId: string;
      order: number;
      title: string;
      active: boolean;
      model: number;
      public: boolean;
      groupTitle: string | null;
      groupDescription: string | null;
      description: string | null;
      badge: string | null;
      billingAddressCollection: string;
      hasQuantity: boolean;
      canBuyAgain: boolean;
    }[]
  >;
  getAllSubscriptionFeatures(): Promise<
    {
      name: string;
      order: number;
      title: string;
      type: number;
      value: number;
      accumulate: boolean;
    }[]
  >;
  getSubscriptionProduct(id: string): Promise<{
    id: string;
    stripeId: string;
    order: number;
    title: string;
    active: boolean;
    model: number;
    public: boolean;
    groupTitle: string | null;
    groupDescription: string | null;
    description: string | null;
    badge: string | null;
    billingAddressCollection: string;
    hasQuantity: boolean;
    canBuyAgain: boolean;
    tenantProducts: any[];
    usageBasedPrices: any[];
    prices: any[];
    assignsTenantTypes?: any[] | undefined;
    features: any[];
  } | null>;
  getSubscriptionProductByStripeId(stripeId: string): Promise<{
    id: string;
    stripeId: string;
    order: number;
    title: string;
    active: boolean;
    model: number;
    public: boolean;
    groupTitle: string | null;
    groupDescription: string | null;
    description: string | null;
    badge: string | null;
    billingAddressCollection: string;
    hasQuantity: boolean;
    canBuyAgain: boolean;
  } | null>;
  getSubscriptionPrices(): Promise<SubscriptionPriceWithProductDto[]>;
  getSubscriptionPrice(id: string): Promise<SubscriptionPriceWithProductDto | null>;
  getSubscriptionPriceByStripeId(stripeId: string): Promise<SubscriptionPriceWithProductDto | null>;
  getSubscriptionUsageBasedPriceByStripeId(stripeId: string): Promise<SubscriptionUsageBasedPriceWithProductDto | null>;
  createSubscriptionProduct(data: {
    stripeId: string;
    order: number;
    title: string;
    model: PricingModel;
    description?: string;
    badge?: string;
    groupTitle?: string;
    groupDescription?: string;
    active: boolean;
    public: boolean;
    billingAddressCollection: string;
    hasQuantity: boolean;
    canBuyAgain: boolean;
  }): Promise<SubscriptionProduct>;
  updateSubscriptionProduct(
    id: string,
    data: {
      stripeId?: string | undefined;
      order?: number | undefined;
      title?: string | undefined;
      model?: PricingModel | undefined;
      description?: string | null;
      badge?: string | null;
      groupTitle?: string | null;
      groupDescription?: string | null;
      public?: boolean;
      billingAddressCollection?: string;
      hasQuantity?: boolean;
      canBuyAgain?: boolean;
    }
  ): Promise<SubscriptionProduct>;
  updateSubscriptionProductStripeId(
    id: string,
    data: {
      stripeId: string;
    }
  ): Promise<{
    id: string;
    stripeId: string;
    order: number;
    title: string;
    active: boolean;
    model: number;
    public: boolean;
    groupTitle: string | null;
    groupDescription: string | null;
    description: string | null;
    badge: string | null;
    billingAddressCollection: string;
    hasQuantity: boolean;
    canBuyAgain: boolean;
  }>;
  updateSubscriptionPriceStripeId(
    id: string,
    data: {
      stripeId: string;
    }
  ): Promise<{
    id: string;
    stripeId: string;
    active: boolean;
    subscriptionProductId: string;
    type: number;
    billingPeriod: number;
    price: number;
    currency: string;
    trialDays: number;
  }>;
  createSubscriptionPrice(data: {
    subscriptionProductId: string;
    stripeId: string;
    type: SubscriptionPriceType;
    billingPeriod: SubscriptionBillingPeriod;
    price: number;
    currency: string;
    trialDays: number;
    active: boolean;
  }): Promise<SubscriptionPrice>;
  createSubscriptionUsageBasedPrice(data: {
    subscriptionProductId: string;
    stripeId: string;
    currency: string;
    billingPeriod: SubscriptionBillingPeriod;
    unit: string;
    unitTitle: string;
    unitTitlePlural: string;
    usageType: string;
    aggregateUsage: string;
    tiersMode: string;
    billingScheme: string;
  }): Promise<SubscriptionUsageBasedPrice>;
  createSubscriptionUsageBasedTier(data: {
    subscriptionUsageBasedPriceId: string;
    from: number;
    to: number | undefined;
    perUnitPrice: number | undefined;
    flatFeePrice: number | undefined;
  }): Promise<{
    id: string;
    from: number;
    subscriptionUsageBasedPriceId: string;
    to: number | null;
    perUnitPrice: number | null;
    flatFeePrice: number | null;
  }>;
  createSubscriptionFeature(
    subscriptionProductId: string,
    data: {
      order: number;
      title: string;
      name: string;
      type: SubscriptionFeatureLimitType;
      value: number;
      href?: string | null;
      badge?: string | null;
      accumulate?: boolean;
    }
  ): Promise<SubscriptionFeature>;
  deleteSubscriptionProduct(id: string): Promise<{
    id: string;
    stripeId: string;
    order: number;
    title: string;
    active: boolean;
    model: number;
    public: boolean;
    groupTitle: string | null;
    groupDescription: string | null;
    description: string | null;
    badge: string | null;
    billingAddressCollection: string;
    hasQuantity: boolean;
    canBuyAgain: boolean;
  }>;
  deleteSubscriptionPrice(id: string): Promise<{
    id: string;
    stripeId: string;
    active: boolean;
    subscriptionProductId: string;
    type: number;
    billingPeriod: number;
    price: number;
    currency: string;
    trialDays: number;
  }>;
  deleteSubscriptionUsageBasedTier(id: string): Promise<{
    id: string;
    subscriptionUsageBasedPriceId: string;
    from: number;
    to: number | null;
    perUnitPrice: number | null;
    flatFeePrice: number | null;
  }>;
  deleteSubscriptionUsageBasedPrice(id: string): Promise<{
    id: string;
    subscriptionProductId: string;
    stripeId: string;
    billingPeriod: number;
    currency: string;
    unit: string;
    unitTitle: string;
    unitTitlePlural: string;
    usageType: string;
    aggregateUsage: string;
    tiersMode: string;
    billingScheme: string;
  }>;
  deleteSubscriptionFeatures(subscriptionProductId: string): Promise<Prisma.BatchPayload>;
}
