import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import DangerClient from "./DangerClient";

export default async function DangerPageServer(props: IServerComponentsProps) {
  const params = (await props.params) || {};
  
  await verifyUserHasPermission("admin.entities.view");
  
  if (!params.entity) {
    throw new Error("Entity slug is missing from URL params");
  }
  
  const entity = await db.entities.getEntityBySlug({ tenantId: null, slug: params.entity });
  const count = await db.rows.countRows({ entityId: entity.id });

  return <DangerClient entity={entity} count={count} />;
}
