import { Entity } from "@prisma/client";
import { getServerTranslations } from "@/i18n/server";
import { redirect } from "next/navigation";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import TabsVertical from "@/components/ui/tabs/TabsVertical";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

type PageProps = {
  item: Entity;
  entity: string;
};

async function getData(props: IServerComponentsProps): Promise<PageProps> {
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
    entity: params.entity!,
  };
}

export default async function EditEntityRoute(props: IServerComponentsProps) {
  const data = await getData(props);
  const { item, entity } = data;
  
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
            {<></>}
          </div>
        </div>
      </div>
    </EditPageLayout>
  );
}
