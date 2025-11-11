import { redirect } from "next/navigation";
import { Metadata } from "next";
import {
  getStripeCustomer,
  getStripeInvoices,
  getStripePaymentIntents,
  getStripePaymentMethods,
  getStripeUpcomingInvoices,
} from "@/utils/stripe.server";
import { getUserInfo } from "@/lib/services/session.server";
import { useDashboardData } from "@/lib/state/useDashboardData";
import { getServerTranslations } from "@/i18n/server";
import { TenantSubscriptionWithDetailsDto } from "@/db/models/subscriptions/TenantSubscriptionsModel";
import { TenantDto } from "@/db/models/accounts/TenantsModel";
import { getActiveTenantSubscriptions, getPlanFeaturesUsage } from "@/utils/services/server/subscriptionService";
import { serverTimingHeaders } from "@/modules/metrics/utils/defaultHeaders.server";
import { promiseHash } from "@/utils/promises/promiseHash";
import FooterBlock from "@/modules/pageBlocks/components/blocks/marketing/footer/FooterBlock";
import HeaderBlock from "@/modules/pageBlocks/components/blocks/marketing/header/HeaderBlock";
import Tabs from "@/components/ui/tabs/Tabs";
import Stripe from "stripe";
import { PlanFeatureUsageDto } from "@/lib/dtos/subscriptions/PlanFeatureUsageDto";
import { db } from "@/db";
import SubscriptionClientWrapper from "./settings.subscription.client";

export { serverTimingHeaders as headers };

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

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("app.navbar.subscription")} | ${process.env.APP_NAME}`,
  };
}

async function getPageData(): Promise<PageData> {
  let { t } = await getServerTranslations();

  const userInfo = await getUserInfo();
  const user = await db.users.getUser(userInfo.userId);
  if (!user) {
    redirect("/login");
  }
  const appConfiguration = await db.appConfiguration.getAppConfiguration();
  if (appConfiguration.app.features.tenantHome !== "/") {
    redirect("/my-subscription");
  }
  const myTenants = await db.tenants.getMyTenants(userInfo.userId);
  if (myTenants.length === 0) {
    redirect("/settings/profile");
  }
  const currentTenant = myTenants[0];
  const tenantId = currentTenant.id;

  const tenantSubscription = await db.tenantSubscriptions.getOrPersistTenantSubscription(tenantId);
  
  const { mySubscription, customer, myInvoices, myPayments, myUpcomingInvoices, myPaymentMethods, myFeatures, products } = await promiseHash({
    mySubscription: getActiveTenantSubscriptions(tenantId),
    customer: getStripeCustomer(tenantSubscription.stripeCustomerId),
    myInvoices: getStripeInvoices(tenantSubscription.stripeCustomerId) ?? [],
    myPayments: getStripePaymentIntents(tenantSubscription.stripeCustomerId, "succeeded") ?? [],
    myUpcomingInvoices: getStripeUpcomingInvoices(tenantSubscription.products.filter((f) => f.stripeSubscriptionId).flatMap((p) => p.stripeSubscriptionId!)),
    myPaymentMethods: getStripePaymentMethods(tenantSubscription.stripeCustomerId),
    myFeatures: getPlanFeaturesUsage(tenantId),
    products: db.subscriptionProducts.getAllSubscriptionProducts(true),
  });
  
  return {
    currentTenant,
    mySubscription,
    customer,
    products,
    myFeatures,
    myInvoices,
    myPayments,
    myUpcomingInvoices,
    myPaymentMethods,
  };
}

export default async function SubscriptionRoute() {
  const data = await getPageData();

  return (
    <div>
      <HeaderBlock />
      <div className="mx-auto max-w-5xl space-y-5 px-4">
        <div className="border-border border-b pb-5">
          {/* <h3 className="text-xl font-semibold leading-6 text-foreground">Settings</h3> */}
          <Tabs
            tabs={[
              { name: `Profile`, routePath: "/settings" },
              { name: `Subscription`, routePath: "/settings/subscription" },
            ]}
            exact
          />
        </div>
        <SubscriptionClientWrapper data={data} />
      </div>
      <FooterBlock />
    </div>
  );
}
