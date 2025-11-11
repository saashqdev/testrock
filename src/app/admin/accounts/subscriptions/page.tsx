import { defaultSiteTags, getMetaTags } from "@/modules/pageBlocks/seo/SeoMetaTagsUtils";
import { getServerTranslations } from "@/i18n/server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "@/lib/helpers/RowPaginationHelper";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { db } from "@/db";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import Component from "./component";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return getMetaTags({
    title: `${t("models.subscription.plural")} | ${defaultSiteTags.title}`,
  });
}

export default async function SubscriptionsPage(props: IServerComponentsProps) {
  await verifyUserHasPermission("admin.accounts.view");
  const { t } = await getServerTranslations();
  const request = props.request!;

  const filterableProperties: FilterablePropertyDto[] = [
    {
      name: "status",
      title: t("shared.status"),
      manual: true,
      options: [
        { value: "active", name: "Active" },
        { value: "ended", name: "Ended" },
        { value: "active-cancelled", name: "Active Cancelled" },
        { value: "active-not-cancelled", name: "Active Not Cancelled" },
      ],
    },
    {
      name: "subscriptionProductId",
      title: t("models.subscriptionProduct.object"),
      manual: true,
      options: (await db.subscriptionProducts.getAllSubscriptionProducts()).map((f) => {
        return {
          value: f.id ?? "",
          name: t(f.title),
        };
      }),
    },
    {
      name: "tenantId",
      title: t("models.tenant.object"),
      manual: true,
      options: (await db.tenants.adminGetAllTenantsIdsAndNames()).map((tenant) => {
        return {
          value: tenant.id,
          name: tenant.name,
        };
      }),
    },
  ];
  
  const filters = getFiltersFromCurrentUrl(request, filterableProperties);
  const urlSearchParams = new URL(request.url).searchParams;
  const currentPagination = getPaginationFromCurrentUrl(urlSearchParams);
  const { items, pagination } = await db.tenantSubscriptionProducts.getAllTenantSubscriptionProducts(filters, currentPagination);

  return (
    <Component
      items={items}
      pagination={pagination}
      filterableProperties={filterableProperties}
      isStripeTest={process.env.STRIPE_SK?.toString().startsWith("sk_test_") ?? true}
    />
  );
}
