import Link from "next/link";
import { Fragment } from "react";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import NoCodeViewsHelper, { NoCodeEntityViewsDto } from "@/lib/helpers/NoCodeViewsHelper";
import { headers } from "next/headers";
import { getServerTranslations } from "@/i18n/server";
import { db } from "@/db";

type LoaderData = {
  entities: EntityWithDetailsDto[];
};

async function getData(): Promise<LoaderData> {
  const headersList = await headers();
  const request = new Request("http://localhost", {
    headers: headersList,
  });

  await verifyUserHasPermission("admin.entities.view");
  const data: LoaderData = {
    entities: await db.entities.getAllEntities(null),
  };
  return data;
}

export default async function NoCodeEntitiesPage() {
  const data = await getData();
  const { t } = await getServerTranslations();

  const previews: NoCodeEntityViewsDto[] = NoCodeViewsHelper.getBlockPreviews({ t, entities: data.entities });
  return (
    <div className="space-y-4 overflow-y-auto p-4 sm:px-8 sm:py-7">
      {data.entities.length === 0 ? (
        <Link
          href="/admin/entities/new"
          className="focus:outline-hidden relative flex w-full flex-col justify-center space-y-2 rounded-lg border-2 border-dashed border-border p-6 text-center hover:border-border focus:border-2 focus:border-gray-600 focus:bg-background"
        >
          <div className="block text-sm font-medium text-foreground">Create entity</div>
        </Link>
      ) : (
        <>
          {previews.map((item) => {
            return (
              <div key={item.title} className="space-y-2">
                <div>
                  <div className="text-lg font-bold text-foreground">{item.title}</div>
                  <div className="text-sm text-muted-foreground">{item.description}</div>
                </div>
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                  {item.views.map((view) => (
                    <Fragment key={view.name}>
                      {!view.error ? (
                        <Link
                          href={`${view.href}`}
                          className="focus:outline-hidden relative flex w-full flex-col justify-center space-y-2 rounded-lg border-2 border-dashed border-border p-3 text-center hover:border-border focus:border-2 focus:border-gray-600 focus:bg-background"
                        >
                          {view.icon}
                          <div className="block text-sm font-medium text-foreground">
                            {view.name} {view.error && <span className="text-xs lowercase text-red-500">({view.error})</span>}
                          </div>
                          <div className="block text-xs text-muted-foreground">{view.description}</div>
                          {view.underConstruction && <div className="text-xs lowercase text-orange-500">(Under 🚧 Construction)</div>}
                        </Link>
                      ) : (
                        <div className="relative flex w-full flex-col justify-center space-y-2 rounded-lg border-2 border-dashed border-red-300 bg-red-50 p-3 text-center">
                          {view.icon}
                          <div className="block text-sm font-medium text-foreground">
                            {view.name} {view.error && <span className="text-xs lowercase text-red-500">({view.error})</span>}
                            {view.underConstruction && <span className="text-xs lowercase text-orange-500">(Under 🚧 Construction)</span>}
                          </div>
                          <div className="block text-xs text-muted-foreground">{view.description}</div>
                        </div>
                      )}
                    </Fragment>
                  ))}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
