"use client";

import SubscriptionSettings from "@/modules/users/components/SubscriptionSettings";
import { TenantSubscriptionWithDetailsDto } from "@/db/models/subscriptions/TenantSubscriptionsModel";
import { TenantDto } from "@/db/models/accounts/TenantsModel";
import Stripe from "stripe";
import { PlanFeatureUsageDto } from "@/lib/dtos/subscriptions/PlanFeatureUsageDto";
import { db } from "@/db";

type PageData = {
  currentTenant: TenantDto;
  mySubscription: TenantSubscriptionWithDetailsDto | null;
  products: Awaited<ReturnType<typeof db.subscriptionProducts.getAllSubscriptionProducts>>;
  customer: Stripe.Customer | Stripe.DeletedCustomer | null;
  myInvoices: Stripe.Invoice[];
  myPayments: Stripe.PaymentIntent[];
  myFeatures: PlanFeatureUsageDto[];
  myUpcomingInvoices: Stripe.Invoice[];
  myPaymentMethods: Stripe.PaymentMethod[];
};

type Props = {
  data: PageData;
};

export default function SubscriptionClientWrapper({ data }: Props) {
  return (
    <SubscriptionSettings
      {...data}
      permissions={{ viewInvoices: true }}
    />
  );
}
