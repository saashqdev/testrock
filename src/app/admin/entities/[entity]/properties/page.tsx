import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import { getNoCodeRoutes } from "@/utils/api/server/EntitiesApi";
import { duplicate } from "@/utils/api/server/PropertiesApi";
import { PropertyWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import PropertiesClient from "./PropertiesClient";
import { db } from "@/db";

async function getPageData(props: IServerComponentsProps) {
  const params = (await props.params) || {};
  const request = props.request!;
  await verifyUserHasPermission("admin.entities.view");
  const entity = await db.entities.getEntityBySlug({ tenantId: null, slug: params.entity ?? "" });
  if (!entity) {
    redirect("/admin/entities");
  }
  
  // Ensure request has proper URL for route generation
  const url = request?.url ? new URL(request.url) : new URL(`http://localhost/admin/entities/${params.entity}/properties`);
  const requestWithUrl = request?.url ? request : new Request(url.toString());
  
  return {
    entity,
    properties: entity.properties,
    allEntities: await db.entities.getAllEntities(null),
    routes: getNoCodeRoutes({ request: requestWithUrl, params }),
  };
}

type ActionData = {
  error?: string;
  properties?: PropertyWithDetailsDto[];
  created?: boolean;
  updated?: boolean;
  deleted?: boolean;
};
const success = (data: ActionData) => Response.json(data, { status: 200 });
const badRequest = (data: ActionData) => Response.json(data, { status: 400 });
export const action = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const request = props.request!;
  await verifyUserHasPermission("admin.entities.update");
  const { t } = await getServerTranslations();

  const entity = await db.entities.getEntityBySlug({ tenantId: null, slug: params.entity ?? "" });
  if (!entity) {
    return redirect("/admin/entities");
  }

  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";

  if (action === "set-orders") {
    const items: { id: string; order: number }[] = form.getAll("orders[]").map((f: FormDataEntryValue) => {
      return JSON.parse(f.toString());
    });

    await Promise.all(
      items.map(async ({ id, order }) => {
        await db.properties.updatePropertyOrder(id, Number(order));
      })
    );
    return Response.json({ updated: true });
  } else if (action === "delete") {
    await verifyUserHasPermission("admin.entities.delete");
    const id = form.get("id")?.toString() ?? "";
    const existingProperty = await db.properties.getProperty(id);
    if (!existingProperty) {
      return badRequest({ error: t("shared.notFound") });
    }
    await db.properties.deleteProperty(id);
    return success({
      properties: (await db.entities.getEntityBySlug({ tenantId: null, slug: params.entity ?? "" }))?.properties,
      deleted: true,
    });
  } else if (action === "toggle-display") {
    const id = form.get("id")?.toString() ?? "";
    const existingProperty = await db.properties.getProperty(id);
    if (!existingProperty) {
      return badRequest({ error: t("shared.notFound") });
    }
    await db.properties.updateProperty(id, {
      isDisplay: !existingProperty.isDisplay,
    });
    return Response.json({});
  } else if (action === "duplicate") {
    await verifyUserHasPermission("admin.entities.create");
    try {
      const propertyId = form.get("id")?.toString() ?? "";
      await duplicate({ entity, propertyId });
      return Response.json({ created: true });
    } catch (e: any) {
      return badRequest({ error: e.message });
    }
  }
  return badRequest({ error: t("shared.invalidForm") });
};

export default async function PropertiesPage(props: IServerComponentsProps) {
  const data = await getPageData(props);
  return <PropertiesClient {...data} />;
}
