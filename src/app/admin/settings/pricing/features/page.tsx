import { verifyUserHasPermission } from "@/modules/permissions/services/UserPermissionsService";
import { getDefaultSiteTags, defaultSeoMetaTags} from "@/modules/pageBlocks/pages/defaultSeoMetaTags";
import { getServerTranslations } from "@/i18n/server";
import { db } from "@/db";
import { SubscriptionProductDto } from "@/modules/subscriptions/dtos/SubscriptionProductDto";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import Component from "./component";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return defaultSeoMetaTags({
    title: `Pricing Features | ${getDefaultSiteTags.title}`,
  });
}

export type PricingFeaturesLoaderData = {
  items: SubscriptionProductDto[];
};
async function load(props: IServerComponentsProps) {
  const searchParams = await props.searchParams;
  await verifyUserHasPermission("admin.pricing.view");
  const ids: string[] = [];
  if (searchParams?.ids) {
    if (Array.isArray(searchParams.ids)) {
      ids.push(...searchParams.ids);
    } else {
      ids.push(searchParams.ids);
    }
  }
  const rawItems =
    ids.length > 0 ? await db.subscriptionProducts.getSubscriptionProductsInIds(ids) : await db.subscriptionProducts.getAllSubscriptionProductsWithTenants();
  const items: SubscriptionProductDto[] = rawItems.map((item: any) => ({
    ...item,
    prices: item.prices ?? [],
    features: item.features ?? [],
  }));
  return { items };
}

export default async function (props: IServerComponentsProps) {
  const data = await load(props);
  return <Component data={data} />;
}
