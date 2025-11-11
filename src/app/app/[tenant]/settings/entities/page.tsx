import Link from "next/link";
import { getServerTranslations } from "@/i18n/server";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import TableSimple from "@/components/ui/tables/TableSimple";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

type LoaderData = {
  allEntities: EntityWithDetailsDto[];
};

async function getData(props: IServerComponentsProps): Promise<LoaderData> {
  const params = (await props.params) || {};
  const request = props.request!;
  await requireAuth();
  const appConfiguration = await db.appConfiguration.getAppConfiguration();
  if (!appConfiguration.app.features.tenantEntityCustomization) {
    throw Error("Entity customization is not enabled");
  }
  const tenantId = await getTenantIdOrNull({ request, params });
  const allEntities = await db.entities.getAllEntities(null);
  return {
    allEntities,
  };
}

export default async function EntitiesPage(props: IServerComponentsProps) {
  const { t } = await getServerTranslations();
  const data = await getData(props);
  return (
    <EditPageLayout title={t("models.entity.plural")}>
      <div className="space-y-2">
        <TableSimple
          items={data.allEntities}
          actions={[
            {
              title: t("models.entity.templates"),
              onClickRoute: (_, item) => item.slug + "-templates",
            },
            {
              title: t("models.property.plural"),
              onClickRoute: (_, item) => item.slug,
            },
          ]}
          headers={[
            {
              name: "title",
              title: t("models.entity.title"),
              value: (item) => (
                <div>
                  <div className="flex items-center space-x-1">
                    <Link href={item.slug} className="font-medium hover:underline">
                      {t(item.titlePlural)}
                    </Link>
                  </div>
                </div>
              ),
            },
            {
              name: "properties",
              title: t("models.property.plural"),
              className: "w-full text-xs",
              value: (item) => (
                <div className="max-w-xs truncate">
                  {item.properties.filter((f) => !f.isDefault).length > 0 ? (
                    <Link className="truncate pb-1 hover:underline" href={item.slug}>
                      {item.properties
                        .filter((f) => !f.isDefault)
                        .map((f) => t(f.title) + (f.isRequired ? "*" : ""))
                        .join(", ")}
                    </Link>
                  ) : (
                    <Link className="text-muted-foreground truncate pb-1 hover:underline" href={item.slug}>
                      {t("shared.setCustomProperties")}
                    </Link>
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>
    </EditPageLayout>
  );
}
