import { Entity } from "@prisma/client";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { headers } from "next/headers";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import TabsVertical from "@/components/ui/tabs/TabsVertical";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

type PageProps = {
  item: Entity;
  entity: string;
};

type LayoutProps = IServerComponentsProps & {
  children: ReactNode;
};

async function getData(props: IServerComponentsProps): Promise<PageProps> {
  const params = (await props.params) || {};
  await verifyUserHasPermission("admin.entities.update");
  const item = await db.entities.getEntityBySlug({ tenantId: null, slug: params.entity! });
  if (!item) {
    redirect("/admin/entities");
  }

  // Note: Layouts don't handle exact path redirects - use page.tsx for that
  // The redirect logic has been removed as it's not appropriate for a layout component
  
  return {
    item,
    entity: params.entity!,
  };
}

export default async function EditEntityRoute(props: LayoutProps) {
  const data = await getData(props);
  const { item, entity } = data;
  
  // Check if we're on the no-code route
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const isNoCodeRoute = pathname.includes('/no-code');
  
  // If on no-code route, render without sidebar
  if (isNoCodeRoute) {
    return <>{props.children}</>;
  }
  
  return (
    <EditPageLayout
      title={item.title}
      menu={[
        { title: "Entities", routePath: "/admin/entities" },
        { title: item.title, routePath: `/admin/entities/${entity}/details` },
      ]}
      withHome={false}
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 xl:gap-12">
        <div className="lg:col-span-3">
          <TabsVertical
            tabs={[
              {
                name: "Details",
                routePath: `/admin/entities/${entity}/details`,
              },
              {
                name: "Properties",
                routePath: `/admin/entities/${entity}/properties`,
              },
              {
                name: "Relationships",
                routePath: `/admin/entities/${entity}/relationships`,
              },
              {
                name: "Views",
                routePath: `/admin/entities/${entity}/views`,
              },
              {
                name: "Rows",
                routePath: `/admin/entities/${entity}/rows`,
              },
              // {
              //   name: "Views and Forms",
              //   routePath: `/admin/entities/${entity}/views-and-forms`,
              // },
              {
                name: "Logs",
                routePath: `/admin/entities/logs?entity=${item.id}`,
              },
              {
                name: "Webhooks",
                routePath: `/admin/entities/${entity}/webhooks`,
              },
              {
                name: "Templates",
                routePath: `/admin/entities/${entity}/templates`,
              },
              {
                name: "API",
                routePath: `/admin/entities/${entity}/api`,
              },
              {
                name: "No-code",
                routePath: `/admin/entities/${entity}/no-code`,
              },
              {
                name: "Danger",
                routePath: `/admin/entities/${entity}/danger`,
              },
            ]}
          />
        </div>
        <div className="lg:col-span-9">
          <div className="w-full">
            {props.children}
          </div>
        </div>
      </div>
    </EditPageLayout>
  );
}
