import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { RowWithDetailsDto } from "@/db/models/entityBuilder/RowsModel";
import ServerError from "@/components/ui/errors/ServerError";
import { getPaginationFromCurrentUrl } from "@/lib/helpers/RowPaginationHelper";
import { getRowsWithPagination } from "@/lib/helpers/server/RowPaginationService";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import AdminEntityRowsList from "./AdminEntityRowsList";
import { db } from "@/db";

type LoaderData = {
  entity: EntityWithDetailsDto;
  items: RowWithDetailsDto[];
  pagination: PaginationDto;
};
const loader = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const searchParams = (await props.searchParams) || {};
  await verifyUserHasPermission("admin.entities.view");
  const entity = await db.entities.getEntityBySlug({ tenantId: null, slug: params.entity ?? "" });
  if (!entity) {
    return redirect("/admin/entities");
  }
  const urlSearchParams = new URLSearchParams(Object.entries(searchParams).map(([key, value]) => [key, String(value)]));
  const currentPagination = getPaginationFromCurrentUrl(urlSearchParams);
  const { items, pagination } = await getRowsWithPagination({
    entityId: entity.id,
    page: currentPagination.page,
    pageSize: currentPagination.pageSize,
    orderBy: [{ createdAt: "desc" }],
  });
  const data: LoaderData = {
    entity,
    items,
    pagination,
  };
  return data;
};

type ActionData = {
  error?: string;
};
const badRequest = (data: ActionData) => Response.json(data, { status: 400 });
export const action = async (props: IServerComponentsProps) => {
  const { t } = await getServerTranslations();
  return badRequest({ error: t("shared.invalidForm") });
};

export default async function EditEntityIndexRoute(props: IServerComponentsProps) {
  const data = await loader(props);
  // Serialize data to handle Decimal and Date objects
  const serializedData = JSON.parse(JSON.stringify(data));
  return (
    <div className="space-y-3">
      <h3 className="text-foreground text-sm font-medium leading-3">Rows</h3>
      <AdminEntityRowsList entity={serializedData.entity} items={serializedData.items} pagination={serializedData.pagination} />
    </div>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
