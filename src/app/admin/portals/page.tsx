import { defaultSiteTags, getMetaTags } from "@/modules/pageBlocks/pages/defaultSeoMetaTags";
import { getServerTranslations } from "@/i18n/server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "@/lib/helpers/RowPaginationHelper";
import { db } from "@/db";
import Component from "./component";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return getMetaTags({
    title: `${t("models.portal.plural")} | ${defaultSiteTags.title}`,
  });
}

export default async function AdminPortalsPage(props: IServerComponentsProps) {
  await verifyUserHasPermission("admin.pages.view");
  const { t } = await getServerTranslations();
  const request = props.request!;

  const filterableProperties = [
    { name: "title", title: "models.portal.object" },
    { name: "subdomain", title: "Subdomain" },
    {
      name: "tenantId",
      title: "models.tenant.object",
      manual: true,
      options: [
        { value: "null", name: "{Admin}" },
        ...(await db.tenants.adminGetAllTenants()).map((item) => {
          return {
            value: item.id,
            name: item.name,
          };
        }),
      ],
    },
  ];

  const filters = getFiltersFromCurrentUrl(request, filterableProperties);
  const urlSearchParams = request?.url ? new URL(request.url).searchParams : new URLSearchParams();
  const currentPagination = getPaginationFromCurrentUrl(urlSearchParams);

  const { items, pagination } = await db.portals.getAllPortals({
    filters,
    filterableProperties,
    pagination: currentPagination,
  });

  // Add portal URL to each item
  const itemsWithUrl = items.map((item) => {
    const portalUrl = item.domain ? `https://${item.domain}` : `https://${item.subdomain}`;
    return {
      ...item,
      portalUrl,
    };
  });

  const appConfiguration = await db.appConfiguration.getAppConfiguration();

  return <Component items={itemsWithUrl} filterableProperties={filterableProperties} pagination={pagination} appConfiguration={appConfiguration} />;
}
