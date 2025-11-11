import { redirect } from "next/navigation";
import { EntitiesApi } from "@/utils/api/server/EntitiesApi";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import PropertiesClient from "./component";

async function getPageData(props: IServerComponentsProps) {
  const params = (await props.params) || {};
  const request = props.request!;
  await verifyUserHasPermission("admin.entities.view");
  const entity = await db.entities.getEntityBySlug({ tenantId: null, slug: params.entity ?? "" });
  if (!entity) {
    redirect("/admin/entities");
  }
  return {
    entity,
    properties: entity.properties,
    allEntities: await db.entities.getAllEntities(null),
    routes: EntitiesApi.getNoCodeRoutes({ request, params }),
  };
}

export default async function PropertiesPage(props: IServerComponentsProps) {
  const data = await getPageData(props);
  return <PropertiesClient {...data} />;
}
