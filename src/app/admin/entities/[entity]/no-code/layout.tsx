import { redirect } from "next/navigation";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import ServerError from "@/components/ui/errors/ServerError";
import { db } from "@/db";
import { EntityCrudPreviewRouteClient } from "./EntityCrudPreviewRouteClient";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import { ReactNode } from "react";

type LayoutProps = {
  params: Promise<{ entity: string }>;
  children: ReactNode;
};

async function getData(params: Promise<{ entity: string }>) {
  const resolvedParams = await params;
  await verifyUserHasPermission("admin.entities.update");
  const item = await db.entities.getEntityBySlug({ tenantId: null, slug: resolvedParams.entity! });
  if (!item) {
    redirect("/admin/entities");
  }

  return {
    item,
  };
}

export default async function EntityCrudPreviewLayout(props: LayoutProps) {
  const params = await props.params;
  const data = await getData(props.params);

  return (
    <EditPageLayout
      title=""
      menu={[
        { title: "Entities", routePath: "/admin/entities" },
        { title: data.item.title, routePath: `/admin/entities/${params.entity}/details` },
        { title: "No-code", routePath: `/admin/entities/${params.entity}/no-code` },
      ]}
      withHome={false}
    >
      <EntityCrudPreviewRouteClient item={data.item} entitySlug={params.entity}>
        {props.children}
      </EntityCrudPreviewRouteClient>
    </EditPageLayout>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
