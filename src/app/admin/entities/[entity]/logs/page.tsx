import { redirect } from "next/navigation";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import LogsTable from "@/components/app/events/LogsTable";
import { LogWithDetailsDto } from "@/db/models/logs/LogsModel";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { getPaginationFromCurrentUrl } from "@/lib/helpers/RowPaginationHelper";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

type LoaderData = {
  items: LogWithDetailsDto[];
  pagination: PaginationDto;
};

export default async function EditEntityIndexRoute(props: IServerComponentsProps) {
  const params = (await props.params) || {};
  const request = props.request!;

  await verifyUserHasPermission("admin.entities.view");
  const item = await db.entities.getEntityBySlug({ tenantId: null, slug: params.entity ?? "" });
  if (!item) {
    redirect("/admin/entities");
  }

  const urlSearchParams = new URL(request.url).searchParams;
  const currentPagination = getPaginationFromCurrentUrl(urlSearchParams);
  const { items, pagination } = await db.logs.getAllRowLogs({ entityId: item.id, pagination: currentPagination });

  return (
    <div>
      <LogsTable withTenant={true} items={items} pagination={pagination} />
    </div>
  );
}
