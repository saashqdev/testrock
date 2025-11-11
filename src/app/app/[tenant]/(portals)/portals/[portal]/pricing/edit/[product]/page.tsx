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
import { SubscriptionFeatureDto } from "@/lib/dtos/subscriptions/SubscriptionFeatureDto";
import { Portal } from "@prisma/client";
import PricingEditClient from "./pricing-edit-client";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("admin.pricing.edit")} | ${process.env.APP_NAME}`,
  };
}

type PageData = {
  title: string;
  portal: Portal;
  item: SubscriptionProductDto;
  plans: SubscriptionProductDto[];
};

async function getPageData(props: IServerComponentsProps): Promise<PageData> {
  const resolvedParams = await props.params;
  const params = resolvedParams || {};
  const request = props.request!;
  
  await requireAuth();
  
  const { t } = await getServerTranslations();
  const tenantId = await getTenantIdOrNull({ request, params });
  const portal = await db.portals.getPortalById(tenantId, params.portal!);
  
  if (!portal) {
    throw redirect(UrlUtils.getModulePath(params, "portals"));
  }
  
  const item = await db.portalSubscriptionProducts.getPortalSubscriptionProduct(portal.id, params.product ?? "");
  
  if (!item) {
    throw redirect(UrlUtils.getModulePath(params, "portals"));
  }

  const data: PageData = {
    title: `${t("admin.pricing.edit")} | ${process.env.APP_NAME}`,
    portal,
    item,
    plans: await db.portalSubscriptionProducts.getAllPortalSubscriptionProducts(portal.id),
  };
  
  return data;
}

export default async function PricingEditPage(props: IServerComponentsProps) {
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
    
    // Re-fetch portal to ensure it's not null in this scope
    const currentPortal = await db.portals.getPortalById(tenantId, params.portal!);
    if (!currentPortal) {
      return { error: "Portal not found" };
    }
    
    const item = await db.portalSubscriptionProducts.getPortalSubscriptionProduct(currentPortal.id, params.product ?? "");
    
    if (!item) {
      return { error: t("shared.notFound") };
    }
    
    if (action === "edit") {
      const order = Number(formData.get("order"));
      const title = formData.get("title")?.toString();
      const description = formData.get("description")?.toString() ?? "";
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

      if (!title) {
        return { error: "Title required" };
      }

      const plan: SubscriptionProductDto = {
        id: params.product,
        stripeId: "",
        order,
        title,
        description,
        badge,
        groupTitle,
        groupDescription,
        active: true,
        model: item.model,
        public: isPublic,
        prices: [],
        usageBasedPrices: [],
        features: [],
        billingAddressCollection: isBillingRequired ? "required" : "auto",
        hasQuantity,
        canBuyAgain,
      };

      try {
        await PortalPricingServer.updatePlan(currentPortal.id, plan, features);
        
        // If successful, revalidate and redirect
        revalidatePath(UrlUtils.getModulePath(params, "portals"));
        redirect(UrlUtils.getModulePath(params, "portals"));
      } catch (e: any) {
        return { error: e?.toString() };
      }
    } else if (action === "delete") {
      try {
        await PortalPricingServer.deletePlan(currentPortal.id, item);
        
        // If successful, revalidate and redirect
        revalidatePath(UrlUtils.getModulePath(params, `portals/${currentPortal.id}/pricing`));
        redirect(UrlUtils.getModulePath(params, `portals/${currentPortal.id}/pricing`));
      } catch (error: any) {
        return { error: error.message };
      }
    } else {
      return { error: t("shared.invalidForm") };
    }
  }

  return <PricingEditClient data={data} params={params} submitAction={submitPricingForm} />;
}
