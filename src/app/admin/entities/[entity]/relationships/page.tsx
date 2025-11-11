import { EntityRelationshipWithDetailsDto } from "@/db/models/entityBuilder/EntityRelationshipsModel";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import EditEntityRelationshipsClient from "./component";

type LoaderData = {
  items: (EntityRelationshipWithDetailsDto & { _count: { rows: number } })[];
};

async function loader(props: IServerComponentsProps) {
  const params = (await props.params) || {};
  await verifyUserHasPermission("admin.entities.view");
  const entity = await db.entities.getEntityBySlug({ tenantId: null, slug: params.entity ?? "" });
  const items = await db.entityRelationships.getEntityRelationshipsWithCount(entity.id);
  const data: LoaderData = {
    items,
  };
  return data;
}

export default async function EditEntityRelationshipsRoute(props: IServerComponentsProps) {
  const data = await loader(props);

  return <EditEntityRelationshipsClient items={data.items} />;
}
