import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import { Metadata } from "next";
import { EntityViewsWithTenantAndUserDto } from "@/db/models/entityBuilder/EntityViewsModel";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "@/lib/helpers/RowPaginationHelper";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import EntityViewsClient from "./component";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("models.view.plural")} | ${process.env.APP_NAME}`,
  };
}

type LoaderData = {
  items: EntityViewsWithTenantAndUserDto[];
  pagination: PaginationDto;
  filterableProperties: FilterablePropertyDto[];
};

async function getData(props: IServerComponentsProps): Promise<LoaderData> {
  const request = props.request!;
  const { t } = await getServerTranslations();
  await verifyUserHasPermission("admin.entities.view");
  const searchParams = new URL(request.url).searchParams;
  let type = searchParams.get("type");
  if (type && ["default", "tenant", "user", "system"].includes(type) === false) {
    throw redirect("/admin/entities/views/all");
  }

  const urlSearchParams = new URL(request.url).searchParams;
  const pagination = getPaginationFromCurrentUrl(urlSearchParams);

  const filterableProperties: FilterablePropertyDto[] = [
    {
      name: "entityId",
      title: t("models.entity.object"),
      options: (await db.entities.getAllEntitiesSimple({})).map((item) => {
        return {
          value: item.id,
          name: `${t(item.title)} (${item.name})`,
        };
      }),
    },
    {
      name: "tenantId",
      title: t("models.tenant.object"),
      options: (await db.tenants.adminGetAllTenantsIdsAndNames()).map((item) => {
        return {
          value: item.id,
          name: item.name,
        };
      }),
    },
    {
      name: "userId",
      title: t("models.user.object"),
      options: (await db.users.adminGetAllUsersNames()).map((item) => {
        return {
          value: item.id,
          name: item.email,
        };
      }),
    },
  ];
  const filters = getFiltersFromCurrentUrl(request, filterableProperties);

  const { items, total } = await db.entityViews.getAllEntityViews({
    type: type ?? undefined,
    pagination: { pageSize: pagination.pageSize, page: pagination.page },
    filters,
  });
  const data: LoaderData = {
    items,
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems: total,
      totalPages: Math.ceil(total / pagination.pageSize),
    },
    filterableProperties,
  };
  return data;
}

export default async function EntityViewsPage(props: IServerComponentsProps) {
  const data = await getData(props);
  
  return <EntityViewsClient {...data} />;
}
