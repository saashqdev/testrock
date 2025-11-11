import Link from "next/link";
import EntityViewsTable from "@/components/entities/views/EntityViewsTable";
import PlusIcon from "@/components/ui/icons/PlusIcon";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { EntityViewsWithTenantAndUserDto } from "@/db/models/entityBuilder/EntityViewsModel";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

type LoaderData = {
  entity: EntityWithDetailsDto;
  items: EntityViewsWithTenantAndUserDto[];
};

async function getData(props: IServerComponentsProps): Promise<LoaderData> {
  const params = (await props.params) || {};
  const request = props.request!;
  await verifyUserHasPermission("admin.entities.view");
  const entity = await db.entities.getEntityBySlug({ tenantId: null, slug: params.entity! });
  const { items } = await db.entityViews.getAllEntityViews({
    entityId: entity.id,
    pagination: { pageSize: 1000, page: 1 },
  });

  return {
    entity,
    items,
  };
}

export default async function EditEntityIndexRoute(props: IServerComponentsProps) {
  const data = await getData(props);
  return (
    <div className="space-y-3">
      <h3 className="text-foreground text-sm font-medium leading-3">Views</h3>
      <div>
        <div className="space-y-2">
          <EntityViewsTable
            items={data.items}
            onClickRoute={(i) => {
              return `/admin/entities/views/${i.id}`;
            }}
          />

          <Link
            href={`/admin/entities/views/new/${data.entity.name}`}
            className="focus:ring-ring border-border hover:border-border relative block w-full rounded-lg border-2 border-dashed p-4 text-center focus:outline-hidden focus:ring-2 focus:ring-offset-2"
          >
            <PlusIcon className="text-muted-foreground mx-auto h-5" />
            <span className="text-foreground mt-2 block text-sm font-medium">Add custom view</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
