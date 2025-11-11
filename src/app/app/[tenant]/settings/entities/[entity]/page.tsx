import { getServerTranslations } from "@/i18n/server";
import { EntityWithDetailsDto, PropertyWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import EntityPropertiesClient from "./component";

type LoaderData = {
  entity: EntityWithDetailsDto;
  properties: PropertyWithDetailsDto[];
  allEntities: EntityWithDetailsDto[];
};

export default async function EntityPropertiesPage(props: IServerComponentsProps) {
  const params = (await props.params) || {};
  const request = props.request!;
  
  await requireAuth();
  const appConfiguration = await db.appConfiguration.getAppConfiguration();
  if (!appConfiguration.app.features.tenantEntityCustomization) {
    throw Error("Entity customization is not enabled");
  }
  
  const tenantId = await getTenantIdOrNull({ request, params });
  const entity = await db.entities.getEntityBySlug({ tenantId, slug: params.entity ?? "" });
  
  const data: LoaderData = {
    entity,
    properties: entity.properties,
    allEntities: await db.entities.getAllEntities(null),
  };

  return <EntityPropertiesClient data={data} />;
}
