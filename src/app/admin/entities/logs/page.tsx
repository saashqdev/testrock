import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import LogsTable from "@/components/app/events/LogsTable";
import InputFilters from "@/components/ui/input/InputFilters";
import { getServerTranslations } from "@/i18n/server";
import { LogWithDetailsDto } from "@/db/models/logs/LogsModel";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { getPaginationFromCurrentUrl } from "@/lib/helpers/RowPaginationHelper";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

type LoaderData = {
  items: LogWithDetailsDto[];
  pagination: PaginationDto;
  filterableProperties: FilterablePropertyDto[];
};

async function getLogsData(props: IServerComponentsProps): Promise<LoaderData> {
  const params = (await props.params) || {};
  const searchParams = (await props.searchParams) || {};
  await verifyUserHasPermission("admin.entities.view");
  const { t } = await getServerTranslations();
  const tenantId = await getTenantIdOrNull({ params });
  const entities = await db.entities.getAllEntities(null);
  const filterableProperties: FilterablePropertyDto[] = [
    {
      name: "entityId",
      title: t("models.entity.object"),
      options: entities.map((i) => {
        return { value: i.id, name: i.name };
      }),
    },
    {
      name: "tenantId",
      title: t("models.tenant.object"),
      options: [
        { name: "{Admin}", value: "null" },
        ...(await db.tenants.adminGetAllTenantsIdsAndNames()).map((i) => {
          return { value: i.id, name: i.name };
        }),
      ],
    },
    {
      name: "rowId",
      title: t("models.row.object"),
    },
  ];
  const urlSearchParams = new URLSearchParams(Object.entries(searchParams).map(([key, value]) => [key, String(value)]));
  const currentPagination = getPaginationFromCurrentUrl(urlSearchParams);

  // Apply filters from URL search params
  filterableProperties.forEach((property) => {
    const value = urlSearchParams.get(property.name);
    property.value = value ?? null;
    if (property.isNumber && property.value) {
      if (isNaN(Number(property.value))) {
        property.value = null;
      }
    }
  });

  const filters = {
    query: urlSearchParams.get("q") ?? undefined,
    properties: filterableProperties,
  };
  const filterTenantId = filters.properties.find((f) => f.name === "tenantId")?.value;
  const { items, pagination } = await db.logs.getAllRowLogs({
    entityId: filters.properties.find((f) => f.name === "entityId")?.value ?? undefined,
    rowId: filters.properties.find((f) => f.name === "rowId")?.value ?? undefined,
    tenantId: filterTenantId === "null" ? null : (filterTenantId ?? undefined),
    pagination: {
      page: currentPagination.page,
      pageSize: currentPagination.pageSize,
    },
  });
  return {
    items,
    pagination,
    filterableProperties,
  };
}

export default async function EditEntityIndexRoute(props: IServerComponentsProps) {
  const { t } = await getServerTranslations();
  const data = await getLogsData(props);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-3 px-4 py-2 pb-6 sm:px-6 sm:pt-3 lg:px-8 xl:max-w-full">
      <div className="md:border-b md:border-border md:py-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium leading-6 text-foreground">{t("models.log.plural")}</h3>
          <div className="flex items-center space-x-2">
            <InputFilters withSearch={false} filters={data.filterableProperties} />
          </div>
        </div>
      </div>

      <LogsTable withTenant={true} items={data.items} pagination={data.pagination} />
    </div>
  );
}
