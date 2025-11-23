import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import { EntityWebhook } from "@prisma/client";
import EditEntityWebhookClient from "./EditEntityWebhookClient";

type LoaderData = {
  entityId: string;
  item: EntityWebhook;
};
async function getLoaderData(props: IServerComponentsProps): Promise<LoaderData> {
  const params = (await props.params) || {};
  const request = props.request!;
  await verifyUserHasPermission("admin.entities.view");
  const entity = await db.entities.getEntityBySlug({ tenantId: null, slug: params.entity! });
  if (!entity) {
    redirect("/admin/entities");
  }
  const item = await db.entityWebhooks.getEntityWebhook(params.id ?? "");
  if (!item) {
    redirect(`/admin/entities/${params.entity}/webhooks`);
  }
  return {
    entityId: entity.id,
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

  const entity = await db.entities.getEntityBySlug({ tenantId: null, slug: params.entity! });
  if (!entity) {
    return redirect("/admin/entities");
  }

  const existing = await db.entityWebhooks.getEntityWebhook(params.id ?? "");
  if (!existing) {
    return badRequest({ error: t("shared.notFound") });
  }

  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  const webhookAction = form.get("webhook-action")?.toString() ?? "";
  const method = form.get("webhook-method")?.toString() ?? "";
  const endpoint = form.get("webhook-endpoint")?.toString() ?? "";

  if (action === "edit") {
    try {
      await db.entityWebhooks.updateEntityWebhook(params.id ?? "", {
        action: webhookAction,
        method,
        endpoint,
      });
      return redirect(`/admin/entities/${params.entity}/webhooks`);
    } catch (e: any) {
      return badRequest({ error: e.message });
    }
  } else if (action === "delete") {
    await verifyUserHasPermission("admin.entities.delete");
    await db.entityWebhooks.deleteEntityWebhook(existing.id);
    return redirect(`/admin/entities/${params.entity}/webhooks`);
  }
  return badRequest({ error: t("shared.invalidForm") });
};

export default async function EditEntityWebhookRoute(props: IServerComponentsProps) {
  const data = await getLoaderData(props);
  const params = await props.params;

  return <EditEntityWebhookClient item={data.item} entity={params?.entity!} />;
}
