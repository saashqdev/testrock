import { SubscriptionProductDto } from "@/lib/dtos/subscriptions/SubscriptionProductDto";
import { PortalSubscriptionPriceWithProductDto } from "@/db/models/portals/PortalSubscriptionProductsModel";
import { PricingModel } from "@/lib/enums/subscriptions/PricingModel";
import { Prisma, PortalSubscriptionProduct, PortalSubscriptionPrice, PortalSubscriptionFeature } from "@prisma/client";
import { SubscriptionPriceType } from "@/lib/enums/subscriptions/SubscriptionPriceType";
import { SubscriptionBillingPeriod } from "@/lib/enums/subscriptions/SubscriptionBillingPeriod";
import { SubscriptionFeatureLimitType } from "@/lib/enums/subscriptions/SubscriptionFeatureLimitType";

export interface IPortalSubscriptionProductsDb {
  getAllPortalSubscriptionProductsWithUsers(portalId: string): Promise<SubscriptionProductDto[]>;
  getAllPortalSubscriptionProducts(portalId: string, isPublic?: boolean | undefined): Promise<SubscriptionProductDto[]>;
  getPortalSubscriptionProductsInIds(portalId: string, ids: string[]): Promise<SubscriptionProductDto[]>;
  getAllPortalSubscriptionFeatures(portalId: string): Promise<
    {
      name: string;
      order: number;
      title: string;
      type: number;
      value: number;
      accumulate: boolean;
    }[]
  >;
  getPortalSubscriptionProduct(portalId: string, id: string): Promise<SubscriptionProductDto | null>;
  getPortalSubscriptionProductByStripeId(
    portalId: string,
    stripeId: string
  ): Promise<{
    id: string;
    portalId: string;
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
  getPortalSubscriptionPrices(portalId: string): Promise<PortalSubscriptionPriceWithProductDto[]>;
  getPortalSubscriptionPrice(portalId: string, id: string): Promise<PortalSubscriptionPriceWithProductDto | null>;
  getPortalSubscriptionPriceByStripeId(portalId: string, stripeId: string): Promise<PortalSubscriptionPriceWithProductDto | null>;
  createPortalSubscriptionProduct(data: {
    portalId: string;
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
  }): Promise<PortalSubscriptionProduct>;
  updatePortalSubscriptionProduct(
    portalId: string,
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
  ): Promise<PortalSubscriptionProduct>;
  updatePortalSubscriptionProductStripeId(
    portalId: string,
    id: string,
    data: {
      stripeId: string;
    }
  ): Promise<{
    id: string;
    portalId: string;
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
  updatePortalSubscriptionPriceStripeId(
    portalId: string,
    id: string,
    data: {
      stripeId: string;
    }
  ): Promise<{
    id: string;
    portalId: string;
    stripeId: string;
    active: boolean;
    subscriptionProductId: string;
    type: number;
    billingPeriod: number;
    price: Prisma.Decimal;
    currency: string;
    trialDays: number;
  }>;
  createPortalSubscriptionPrice(data: {
    portalId: string;
    subscriptionProductId: string;
    stripeId: string;
    type: SubscriptionPriceType;
    billingPeriod: SubscriptionBillingPeriod;
    price: number;
    currency: string;
    trialDays: number;
    active: boolean;
  }): Promise<PortalSubscriptionPrice>;
  createPortalSubscriptionFeature(
    portalId: string,
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
  ): Promise<PortalSubscriptionFeature>;
  deletePortalSubscriptionProduct(
    portalId: string,
    id: string
  ): Promise<{
    id: string;
    portalId: string;
    stripeId: string;
    active: boolean;
    order: number;
    title: string;
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
  deletePortalSubscriptionPrice(
    portalId: string,
    id: string
  ): Promise<{
    id: string;
    portalId: string;
    subscriptionProductId: string;
    stripeId: string;
    type: number;
    billingPeriod: number;
    price: Prisma.Decimal;
    currency: string;
    trialDays: number;
    active: boolean;
  }>;
  deletePortalSubscriptionFeatures(portalId: string, subscriptionProductId: string): Promise<Prisma.BatchPayload>;
}
