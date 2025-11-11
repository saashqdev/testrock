import { Metadata } from "next";
import LogsTable from "@/components/app/events/LogsTable";
import IndexPageLayout from "@/components/ui/layouts/IndexPageLayout";
import { getServerTranslations } from "@/i18n/server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "@/lib/helpers/RowPaginationHelper";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import InputFilters from "@/components/ui/input/InputFilters";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("models.log.plural")} | ${process.env.APP_NAME}`,
  };
}

export default async function AuditTrailsPage(props: IServerComponentsProps) {
  const request = props.request!;
  await verifyUserHasPermission("admin.auditTrails.view");
  const { t } = await getServerTranslations();

  const filterableProperties: FilterablePropertyDto[] = [
    {
      name: "action",
      title: "models.log.action",
    },
    {
      name: "url",
      title: "models.log.url",
    },
  ];
  const filters = getFiltersFromCurrentUrl(request, filterableProperties);
  const urlSearchParams = new URL(request.url).searchParams;
  const currentPagination = getPaginationFromCurrentUrl(urlSearchParams);
  const { items, pagination } = await db.logs.getAllLogs(currentPagination, filters);

  return (
    <IndexPageLayout title={t("models.log.plural")} buttons={<InputFilters filters={filterableProperties} />}>
      <LogsTable withTenant={true} items={items} pagination={pagination} />
    </IndexPageLayout>
  );
}
