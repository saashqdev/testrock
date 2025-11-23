import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import { getUserInfo } from "@/lib/services/session.server";
import { getTenantIdFromUrl } from "@/utils/services/server/urlService";
import { AppLoaderData } from "@/lib/state/useAppData";
import { loadAppData } from "@/lib/state/server/appData";
import { SubscriptionProductDto } from "@/lib/dtos/subscriptions/SubscriptionProductDto";
import { createStripeCheckoutSession, createStripeCustomer, getStripeCoupon } from "@/utils/stripe.server";
import SubscriptionHelper from "@/lib/helpers/SubscriptionHelper";
import Stripe from "stripe";
import { getBaseURL } from "@/utils/url.server";
import { getCurrenciesAndPeriods, getDefaultBillingPeriod, getDefaultCurrency } from "@/lib/helpers/PricingHelper";
import { SubscriptionBillingPeriod } from "@/lib/enums/subscriptions/SubscriptionBillingPeriod";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import SubscribeView from "./component";
import { db } from "@/db";
import { headers } from "next/headers";

type LoaderData = AppLoaderData & {
  title: string;
  items: SubscriptionProductDto[];
  coupon?: { error?: string; stripeCoupon?: Stripe.Coupon | null };
  currenciesAndPeriod: {
    currencies: { value: string; options: string[] };
    billingPeriods: { value: SubscriptionBillingPeriod; options: SubscriptionBillingPeriod[] };
  };
};

export const loader = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const searchParams = (await props.searchParams) || {};
  const { t } = await getServerTranslations();

  // Check if tenant slug exists
  if (!params.tenant) {
    throw redirect(`/app`);
  }

  const tenantId = await getTenantIdFromUrl(params);

  // If tenant not found, getTenantIdFromUrl returns empty string
  if (!tenantId) {
    throw redirect(`/app`);
  }

  const userInfo = await getUserInfo();

  const user = await db.users.getUser(userInfo.userId);
  if (!user) {
    throw redirect(`/login`);
  }

  const tenant = await db.tenants.getTenant(tenantId);
  if (!tenant) {
    throw redirect(`/app`);
  }

  // Get URL from headers for loadAppData
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const pathname = headersList.get("x-pathname") || `/subscribe/${params.tenant}`;
  const searchString = Object.keys(searchParams).length > 0 ? "?" + new URLSearchParams(searchParams as Record<string, string>).toString() : "";
  const mockRequest = new Request(`${protocol}://${host}${pathname}${searchString}`);
  const appData = await loadAppData({ request: mockRequest, params, t });
  let items = await db.subscriptionProducts.getAllSubscriptionProducts(true);
  const planParam = typeof searchParams.plan === "string" ? searchParams.plan : undefined;
  if (planParam) {
    const filteredItemsRaw = await db.subscriptionProducts.getSubscriptionProductsInIds([planParam]);
    items = filteredItemsRaw.map((item: any) => ({
      ...item,
      tenantProducts: item.tenantProducts ?? [],
      usageBasedPrices: item.usageBasedPrices ?? [],
      prices: item.prices ?? [],
      features: item.features ?? [],
    }));
  }

  const couponParam = typeof searchParams.coupon === "string" ? searchParams.coupon : undefined;
  let coupon: { error?: string; stripeCoupon?: Stripe.Coupon | null } | undefined = undefined;
  if (couponParam) {
    try {
      const stripeCoupon = await getStripeCoupon(couponParam);
      if (!stripeCoupon) {
        throw Error(t("pricing.coupons.invalid"));
      }
      if (stripeCoupon.max_redemptions && stripeCoupon.times_redeemed > stripeCoupon.max_redemptions) {
        throw Error(t("pricing.coupons.expired"));
      }
      if (!stripeCoupon.valid) {
        throw Error(t("pricing.coupons.invalid"));
      }
      coupon = { stripeCoupon };
    } catch (e: any) {
      coupon = { error: e.message };
    }
  }

  const defaultCurrency = getDefaultCurrency(mockRequest);
  const defaultBillingPeriod = getDefaultBillingPeriod(mockRequest);

  const data: LoaderData = {
    title: `${t("pricing.subscribe")} | ${process.env.APP_NAME}`,
    ...appData,
    items,
    coupon,
    currenciesAndPeriod: getCurrenciesAndPeriods(
      items.flatMap((f) => f.prices),
      defaultCurrency,
      defaultBillingPeriod
    ),
  };
  return data;
};

type ActionData = {
  error?: string;
  success?: string;
};

const badRequest = (data: ActionData) => Response.json(data, { status: 400 });

export const action = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const request = props.request!;
  const { t } = await getServerTranslations();
  const tenantId = await getTenantIdFromUrl(params);
  const userInfo = await getUserInfo();
  const form = await request.formData();

  const tenantSubscription = await db.tenantSubscriptions.getOrPersistTenantSubscription(tenantId);
  const user = await db.users.getUser(userInfo.userId);
  const tenant = await db.tenants.getTenant(tenantId);

  if (!tenantSubscription.stripeCustomerId && user && tenant) {
    const customer = await createStripeCustomer(user.email, tenant.name);
    if (customer) {
      tenantSubscription.stripeCustomerId = customer.id;
      await db.tenantSubscriptions.updateTenantSubscriptionCustomerId(tenant.id, {
        stripeCustomerId: customer.id,
      });
    }
  }

  const actionType = form.get("action")?.toString();

  if (!tenantSubscription || !tenantSubscription?.stripeCustomerId) {
    return badRequest({
      error: "Invalid stripe customer",
    });
  }

  if (actionType === "subscribe") {
    try {
      const selectedPlan = await SubscriptionHelper.getPlanFromForm(form);
      const session = await createStripeCheckoutSession({
        subscriptionProduct: selectedPlan.product,
        customer: tenantSubscription.stripeCustomerId,
        line_items: selectedPlan.line_items,
        mode: selectedPlan.mode,
        success_url: `${getBaseURL()}/subscribe/${params.tenant}/{CHECKOUT_SESSION_ID}/success`,
        cancel_url: `${request.url}`,
        freeTrialDays: selectedPlan.freeTrialDays,
        coupon: selectedPlan.coupon,
        referral: selectedPlan.referral,
      });
      if (!session || !session.url) {
        return badRequest({
          error: "Could not update subscription",
        });
      }
      return redirect(session.url);
    } catch (e: any) {
      return badRequest({ error: t(e.message) });
    }
  }
};

export async function generateMetadata(props: IServerComponentsProps) {
  const data = await loader(props);
  return {
    title: data.title,
  };
}

export default async function SubscribePage(props: IServerComponentsProps) {
  const data = await loader(props);
  return <SubscribeView data={data} />;
}
