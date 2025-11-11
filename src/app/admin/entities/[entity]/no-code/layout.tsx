import { Entity } from "@prisma/client";
import { redirect } from "next/navigation";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import ServerError from "@/components/ui/errors/ServerError";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import { EntityCrudPreviewRouteClient } from "./EntityCrudPreviewRouteClient";

type PageProps = {
  params: Promise<{ entity: string }>;
};

async function getData(props: IServerComponentsProps) {
  const params = (await props.params) || {};
  const request = props.request!;
  await verifyUserHasPermission("admin.entities.update");
  const item = await db.entities.getEntityBySlug({ tenantId: null, slug: params.entity! });
  if (!item) {
    redirect("/admin/entities");
  }

  if (new URL(request.url).pathname === "/admin/entities/" + params.entity) {
    redirect("/admin/entities/" + params.entity + "/details");
  }
  
  return {
    item,
  };
}

export default async function EntityCrudPreviewRoute(props: PageProps) {
  const params = await props.params;
  const data = await getData({ params: props.params } as IServerComponentsProps);
  
  return <EntityCrudPreviewRouteClient item={data.item} entitySlug={params.entity} />;
}

export function ErrorBoundary() {
  return <ServerError />;
}
