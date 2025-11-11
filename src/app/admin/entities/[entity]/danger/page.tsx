import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import DangerPage from "./layout";

export default async function DangerPageServer(props: IServerComponentsProps) {
  const request = props.request!;
  const params = (await props.params) || {};
  
  await verifyUserHasPermission("admin.entities.view");
  
  const entity = await db.entities.getEntityBySlug({ tenantId: null, slug: params.entity! });
  const count = await db.rows.countRows({ entityId: entity.id });

  return <DangerPage entity={entity} count={count} />;
}
