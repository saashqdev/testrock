import { EntityTemplate } from "@prisma/client";
import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import UrlUtils from "@/utils/app/UrlUtils";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import EditEntityTemplateClient from "./EditEntityTemplateClient";
import { db } from "@/db";

type LoaderData = {
  entity: EntityWithDetailsDto;
  item: EntityTemplate;
};

async function getLoaderData(props: IServerComponentsProps): Promise<LoaderData> {
  const params = (await props.params) || {};
  const request = props.request!;
  await verifyUserHasPermission("admin.entities.view");
  const tenantId = await getTenantIdOrNull({ request, params });
  const entity = await db.entities.getEntityBySlug({ tenantId, slug: params.entity ?? "" });
  const item = await db.entityTemplates.getEntityTemplate(params.id ?? "", { tenantId });
  if (!item) {
    redirect(UrlUtils.getModulePath(params, `entities/${params.entity}/templates`));
  }
  return {
    entity,
    item,
  };
}

type ActionData = {
  error?: string;
};
const badRequest = (data: ActionData) => Response.json(data, { status: 400 });
export const action = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const request = props.request!;
  await verifyUserHasPermission("admin.entities.update");
  const { t } = await getServerTranslations();
  const tenantId = await getTenantIdOrNull({ request, params });

  const existing = await db.entityTemplates.getEntityTemplate(params.id ?? "", { tenantId });
  if (!existing) {
    return badRequest({ error: t("shared.notFound") });
  }

  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  const title = form.get("title")?.toString() ?? "";
  const config = form.get("config")?.toString() ?? "";

  if (action === "edit") {
    try {
      await db.entityTemplates.updateEntityTemplate(params.id ?? "", {
        title,
        config,
      });
      return redirect(UrlUtils.getModulePath(params, `entities/${params.entity}/templates`));
    } catch (e: any) {
      return badRequest({ error: e.message });
    }
  } else if (action === "delete") {
    await verifyUserHasPermission("admin.entities.delete");
    await db.entityTemplates.deleteEntityTemplate(existing.id);
    return redirect(UrlUtils.getModulePath(params, `entities/${params.entity}/templates`));
  }
  return badRequest({ error: t("shared.invalidForm") });
};

export default async function EditEntityTemplateRoute(props: IServerComponentsProps) {
  const data = await getLoaderData(props);
  const params = (await props.params) || {};

  return <EditEntityTemplateClient entity={data.entity} item={data.item} entitySlug={params.entity ?? ""} />;
}
