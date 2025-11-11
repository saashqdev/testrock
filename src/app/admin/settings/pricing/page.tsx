import { verifyUserHasPermission } from "@/modules/permissions/services/UserPermissionsService";
import { defaultSiteTags, getMetaTags } from "@/modules/pageBlocks/seo/SeoMetaTagsUtils";
import { getServerTranslations } from "@/i18n/server";
import { db } from "@/db";
import { SubscriptionProductDto } from "@/modules/subscriptions/dtos/SubscriptionProductDto";
import defaultPlans from "@/modules/subscriptions/data/defaultPlans.server";
import Component from "./component";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return getMetaTags({
    title: `${t("admin.pricing.title")} | ${defaultSiteTags.title}`,
  });
}

export type PricingLoaderData = {
  title: string;
  isStripeTest: boolean;
  items: SubscriptionProductDto[];
};

const loader = async (): Promise<PricingLoaderData> => {
  if (!process.env.STRIPE_SK) {
    throw new Error("Stripe is not configured: STRIPE_SK is not set.");
  }
  await verifyUserHasPermission("admin.pricing.view");
  const { t } = await getServerTranslations();
  
  const data: PricingLoaderData = {
    title: `${t("admin.pricing.title")} | ${defaultSiteTags.title}`,
    isStripeTest: process.env.STRIPE_SK?.toString().startsWith("sk_test_") ?? true,
    items: (await db.subscriptionProducts.getAllSubscriptionProductsWithTenants()).map((item) => ({
      ...item,
      prices: (item as any).prices ?? [],
      features: (item as any).features ?? [],
    })),
  };

  if (data.items.length === 0) {
    data.items = defaultPlans;
  }

  return data;
};

export default async function AdminPricingPage() {
  const initialData = await loader();
  return <Component data={initialData} />;
}
