import { Suspense } from "react";
import { getDefaultSiteTags, defaultSeoMetaTags} from "@/modules/pageBlocks/pages/defaultSeoMetaTags";
import { getServerTranslations } from "@/i18n/server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "@/lib/helpers/RowPaginationHelper";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { db } from "@/db";
import Component from "./component";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  const siteTags = getDefaultSiteTags();
  return {
    title: `${t("models.user.plural")} | ${siteTags.title}`,
  };
}

export default async function AdminUsersPage(props: IServerComponentsProps) {
  await verifyUserHasPermission("admin.users.view");
  const { t } = await getServerTranslations();
  const request = props.request!;

  const filterableProperties: FilterablePropertyDto[] = [
    { name: "email", title: t("models.user.email") },
    { name: "firstName", title: t("models.user.firstName") },
    { name: "lastName", title: t("models.user.lastName") },
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
    {
      name: "lastLogin",
      title: "Has logged in",
      manual: true,
      options: [
        { value: "last-24-hours", name: t("app.shared.periods.LAST_24_HOURS") },
        { value: "last-7-days", name: t("app.shared.periods.LAST_WEEK") },
        { value: "last-30-days", name: t("app.shared.periods.LAST_30_DAYS") },
        { value: "last-3-months", name: t("app.shared.periods.LAST_3_MONTHS") },
        { value: "last-6-months", name: t("app.shared.periods.LAST_N_MONTHS", { 0: "6" }) },
        { value: "last-year", name: t("app.shared.periods.LAST_YEAR") },
      ],
    },
    {
      name: "isAdmin",
      title: "Is admin",
      manual: true,
      isBoolean: true,
      hideSearch: true,
    },
  ];

  const filters = getFiltersFromCurrentUrl(request, filterableProperties);
  const urlSearchParams = request?.url ? new URL(request.url).searchParams : new URLSearchParams();
  const currentPagination = getPaginationFromCurrentUrl(urlSearchParams);
  const { items, pagination } = await db.users.adminGetAllUsers(filters, currentPagination);

  const lastLogs = (
    await Promise.all(
      items.map(async (user) => {
        const log = await db.logs.getLastUserLog(user.id);
        return log ? { userId: user.id, log } : null;
      })
    )
  )
    .filter((entry) => entry !== null)
    .map((entry) => entry as { userId: string; log: any });

  const adminRoles = await db.roles.getAllRoles("admin");

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Component items={items} filterableProperties={filterableProperties} pagination={pagination} lastLogs={lastLogs} adminRoles={adminRoles} />
    </Suspense>
  );
}
