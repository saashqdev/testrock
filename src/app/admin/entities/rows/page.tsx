import Link from "next/link";
import { getServerTranslations } from "@/i18n/server";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { RowWithDetailsDto } from "@/db/models/entityBuilder/RowsModel";
import TableSimple from "@/components/ui/tables/TableSimple";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "@/lib/helpers/RowPaginationHelper";
import { getRowsWithPagination } from "@/lib/helpers/server/RowPaginationService";
import RowHelper from "@/lib/helpers/RowHelper";
import DateUtils from "@/lib/shared/DateUtils";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import UrlUtils from "@/lib/utils/UrlUtils";
import InputFilters from "@/components/ui/input/InputFilters";
import ActivityHistoryIcon from "@/components/ui/icons/entities/ActivityHistoryIcon";
import ShowPayloadModalButton from "@/components/ui/json/ShowPayloadModalButton";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import { headers } from "next/headers";

type LoaderData = {
  items: RowWithDetailsDto[];
  pagination: PaginationDto;
  entities: EntityWithDetailsDto[];
  filterableProperties: FilterablePropertyDto[];
};

async function getLoaderData(searchParams: IServerComponentsProps["searchParams"]): Promise<LoaderData> {
  // Create a request object from headers and searchParams
  const headersList = await headers();
  const url = new URL(headersList.get("x-url") || "http://localhost:3000");
  
  // Await searchParams if it's a Promise
  const params = await searchParams;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => url.searchParams.append(key, v));
      } else if (value) {
        url.searchParams.set(key, value);
      }
    });
  }
  
  const request = new Request(url.toString());
  
  await verifyUserHasPermission("admin.entities.view");
  const { t } = await getServerTranslations();
  const entities = await db.entities.getAllEntities(null);
  const filterableProperties: FilterablePropertyDto[] = [
    {
      name: "entity",
      title: t("models.entity.object"),
      options: entities.map((i) => {
        return {
          value: i.id,
          name: i.name,
        };
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
  ];
  const filters = getFiltersFromCurrentUrl(request, filterableProperties);
  const urlSearchParams = new URL(request.url).searchParams;
  const currentPagination = getPaginationFromCurrentUrl(urlSearchParams);
  const filterTenantId = filters.properties.find((f) => f.name === "tenantId")?.value;
  const { items, pagination } = await getRowsWithPagination({
    page: currentPagination.page,
    pageSize: currentPagination.pageSize,
    rowWhere: {
      entityId: filters.properties.find((f) => f.name === "entity")?.value ?? undefined,
      tenantId: filterTenantId === "null" ? null : filterTenantId ?? undefined,
    },
  });
  const data: LoaderData = {
    entities,
    items,
    pagination,
    filterableProperties,
  };
  return data;
}

export default async function AdminEntityRowsRoute(props: IServerComponentsProps) {
  const { t } = await getServerTranslations();
  const data = await getLoaderData(props.searchParams);
  
  function findEntity(item: RowWithDetailsDto) {
    return data.entities.find((e) => e.id === item.entityId);
  }
  return (
    <div className="mx-auto w-full max-w-5xl space-y-3 px-4 py-2 pb-6 sm:px-6 sm:pt-3 lg:px-8 xl:max-w-full">
      <div className="md:border-border md:border-b md:py-2">
        <div className="flex items-center justify-between">
          <h3 className="text-foreground text-lg font-medium leading-6">{t("models.row.plural")}</h3>
          <div className="flex items-center space-x-2">
            <InputFilters withSearch={false} filters={data.filterableProperties} />
          </div>
        </div>
      </div>

      <TableSimple
        headers={[
          {
            name: "object",
            title: "Object",
            value: (item) => (
              <div>
                <ShowPayloadModalButton title="Details" description={"Details"} payload={JSON.stringify(item)} />
              </div>
            ),
          },
          {
            name: "tenant",
            title: t("models.tenant.object"),
            value: (item) => (
              <div>
                {item.tenant ? (
                  <Link
                    href={UrlUtils.currentTenantUrl({ tenant: item.tenant.slug }, "")}
                    className="focus:bg-secondary/90 hover:border-border rounded-md border-b border-dashed border-transparent"
                  >
                    {item.tenant.name}
                  </Link>
                ) : (
                  <div>-</div>
                )}
              </div>
            ),
          },
          {
            name: "entity",
            title: t("models.entity.object"),
            value: (i) => t(findEntity(i)?.title ?? ""),
          },
          {
            name: "folio",
            title: t("models.row.folio"),
            value: (i) => RowHelper.getRowFolio(findEntity(i)!, i),
          },
          {
            name: "description",
            title: t("shared.description"),
            value: (i) => RowHelper.getTextDescription({ entity: findEntity(i)!, item: i, t }),
          },
          {
            name: "logs",
            title: t("models.log.plural"),
            value: (item) => (
              <Link href={"/admin/entities/logs?rowId=" + item.id}>
                <ActivityHistoryIcon className="hover:text-theme-800 text-muted-foreground h-4 w-4" />
              </Link>
            ),
          },
          {
            name: "createdByUser",
            title: t("shared.createdBy"),
            value: (item) => item.createdByUser?.email ?? (item.createdByApiKey ? "API" : "?"),
            className: "text-muted-foreground text-xs",
            breakpoint: "sm",
          },
          {
            name: "createdAt",
            title: t("shared.createdAt"),
            value: (item) => DateUtils.dateAgo(item.createdAt),
            formattedValue: (item) => (
              <div className="flex flex-col">
                <div>{DateUtils.dateYMD(item.createdAt)}</div>
                <div className="text-xs">{DateUtils.dateAgo(item.createdAt)}</div>
              </div>
            ),
            className: "text-muted-foreground text-xs",
            breakpoint: "sm",
            sortable: true,
          },
        ]}
        items={data.items}
        pagination={data.pagination}
      />
    </div>
  );
}
