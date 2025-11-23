import Link from "next/link";
import { Fragment } from "react";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { RowWithDetailsDto } from "@/db/models/entityBuilder/RowsModel";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import NoCodeViewsHelper from "@/lib/helpers/NoCodeViewsHelper";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

type LoaderData = {
  entity: EntityWithDetailsDto;
  rows: RowWithDetailsDto[];
};

export default async function EditEntityCrudRoute(props: IServerComponentsProps) {
  const params = (await props.params) || {};

  await verifyUserHasPermission("admin.entities.view");
  const entity = await db.entities.getEntityBySlug({ tenantId: null, slug: params.entity! });
  const rows = await db.rows.getRows({ entityId: entity.id, tenantId: null });

  const previews = NoCodeViewsHelper.getEntityPreviews(entity, rows);
  return (
    <div className="space-y-6 overflow-y-auto p-4 sm:px-8 sm:py-7">
      {previews.map((item) => {
        return (
          <div key={item.title} className="space-y-4">
            <div>
              <div className="text-lg font-bold text-foreground">{item.title}</div>
              <div className="text-sm text-muted-foreground">{item.description}</div>
            </div>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {item.views.map((view) => (
                <Fragment key={view.name}>
                  {!view.error ? (
                    <Link
                      href={view.href!}
                      className="focus:outline-hidden relative flex w-full flex-col justify-center space-y-2 rounded-lg border-2 border-dashed border-border p-3 text-center hover:border-foreground focus:border-2 focus:bg-background"
                    >
                      {view.icon}
                      <div className="block text-sm font-medium text-foreground">{view.name}</div>
                      <div className="block text-xs text-muted-foreground">{view.description}</div>
                      {view.underConstruction && <div className="text-xs lowercase text-orange-500">(Under 🚧 Construction)</div>}
                    </Link>
                  ) : (
                    <div className="relative flex w-full flex-col justify-center space-y-2 rounded-lg border-2 border-dashed border-red-300 bg-red-50 p-3 text-center dark:bg-red-900/20">
                      {view.icon}
                      <div className="block text-sm font-medium text-foreground">
                        {view.name} {view.error && <span className="text-xs lowercase text-red-500">({view.error})</span>}
                      </div>
                      <div className="block text-xs text-muted-foreground">{view.description}</div>
                      {view.underConstruction && <div className="text-xs lowercase text-orange-500">(Under 🚧 Construction)</div>}
                    </div>
                  )}
                </Fragment>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
