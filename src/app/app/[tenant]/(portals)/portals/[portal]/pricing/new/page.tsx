import { redirect } from "next/navigation";
import { Metadata } from "next";
import { db } from "@/db";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { getServerTranslations } from "@/i18n/server";
import UrlUtils from "@/utils/app/UrlUtils";
import PortalPricingServer from "@/modules/portals/services/PortalPricing.server";
import { revalidatePath } from "next/cache";
import { SubscriptionProductDto } from "@/lib/dtos/subscriptions/SubscriptionProductDto";
import { SubscriptionBillingPeriod } from "@/lib/enums/subscriptions/SubscriptionBillingPeriod";
import { SubscriptionFeatureDto } from "@/lib/dtos/subscriptions/SubscriptionFeatureDto";
import { SubscriptionUsageBasedPriceDto } from "@/lib/dtos/subscriptions/SubscriptionUsageBasedPriceDto";
import { PortalWithDetailsDto } from "@/db/models/portals/PortalsModel";
import PricingNewClient from "./pricing-new-client";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  return {
    title: `New product | ${process.env.APP_NAME}`,
  };
}

type PageData = {
  title: string;
  portal: PortalWithDetailsDto;
  plans: SubscriptionProductDto[];
};

async function getPageData(props: IServerComponentsProps): Promise<PageData> {
  const resolvedParams = await props.params;
  const params = resolvedParams || {};
  const request = props.request!;

  await requireAuth();

  const appConfiguration = await db.appConfiguration.getAppConfiguration();
  if (!appConfiguration.portals?.pricing) {
    throw Response.json({ error: "Pricing is not enabled" }, { status: 400 });
  }

  const tenantId = await getTenantIdOrNull({ request, params });
  const portal = await db.portals.getPortalById(tenantId, params.portal!);

  if (!portal) {
    throw redirect(UrlUtils.getModulePath(params, "portals"));
  }

  const data: PageData = {
    title: `New product | ${process.env.APP_NAME}`,
    portal,
    plans: await db.portalSubscriptionProducts.getAllPortalSubscriptionProducts(portal.id),
  };

  return data;
}

export default async function PricingNewPage(props: IServerComponentsProps) {
  const resolvedParams = await props.params;
  const params = resolvedParams || {};
  const request = props.request!;

  await requireAuth();

  const tenantId = await getTenantIdOrNull({ request, params });
  const portal = await db.portals.getPortalById(tenantId, params.portal!);

  if (!portal) {
    redirect(UrlUtils.getModulePath(params, "portals"));
  }

  const data = await getPageData(props);

  // Server Action for form submission
  async function submitPricingForm(prevState: any, formData: FormData) {
    "use server";

    await requireAuth();

    const { t } = await getServerTranslations();
    const action = formData.get("action")?.toString();

    if (action !== "create") {
      return { error: t("shared.invalidForm") };
    }

    // Re-fetch portal to ensure it's not null in this scope
    const currentPortal = await db.portals.getPortalById(tenantId, params.portal!);
    if (!currentPortal) {
      return { error: "Portal not found" };
    }

    const order = Number(formData.get("order"));
    const title = formData.get("title")?.toString();
    const description = formData.get("description")?.toString() ?? "";
    const model = Number(formData.get("model"));
    const badge = formData.get("badge")?.toString() ?? "";
    const groupTitle = formData.get("group-title")?.toString() ?? "";
    const groupDescription = formData.get("group-description")?.toString() ?? "";
    const isPublic = Boolean(formData.get("is-public"));
    const isBillingRequired = Boolean(formData.get("is-billing-required"));
    const hasQuantity = Boolean(formData.get("has-quantity"));
    const canBuyAgain = Boolean(formData.get("can-buy-again"));

    const featuresArr = formData.getAll("features[]");
    const features: SubscriptionFeatureDto[] = featuresArr.map((f: FormDataEntryValue) => {
      return JSON.parse(f.toString());
    });

    const prices: { billingPeriod: SubscriptionBillingPeriod; price: number; currency: string; trialDays?: number }[] = formData
      .getAll("prices[]")
      .map((f: FormDataEntryValue) => {
        return JSON.parse(f.toString());
      });

    const oneTimePricesWithZero = prices.filter((p) => p.billingPeriod === SubscriptionBillingPeriod.ONCE && p.price === 0);
    if (oneTimePricesWithZero.length > 0) {
      return { error: "One-time prices can't be zero" };
    }

    const usageBasedPrices: SubscriptionUsageBasedPriceDto[] = formData.getAll("usage-based-prices[]").map((f: FormDataEntryValue) => {
      return JSON.parse(f.toString());
    });

    if (!title) {
      return { error: "Plan title required" };
    }

    const plan: SubscriptionProductDto = {
      stripeId: "",
      order,
      title,
      model,
      description,
      badge,
      groupTitle,
      groupDescription,
      active: true,
      public: isPublic,
      prices: [],
      features: [],
      usageBasedPrices,
      billingAddressCollection: isBillingRequired ? "required" : "auto",
      hasQuantity,
      canBuyAgain,
    };

    try {
      await PortalPricingServer.createPlan(currentPortal.id, plan, prices, features, t);

      // If successful, revalidate and redirect
      revalidatePath(UrlUtils.getModulePath(params, `portals/${currentPortal.id}/pricing`));
      redirect(UrlUtils.getModulePath(params, `portals/${currentPortal.id}/pricing`));
    } catch (e: any) {
      return { error: e?.toString() };
    }
  }

  return <PricingNewClient data={data} params={params} submitAction={submitPricingForm} />;
}
