"use client";

import { useRouter, useParams, redirect } from "next/navigation";
import EntityWebhookForm from "@/components/entities/webhooks/EntityWebhookForm";
import OpenModal from "@/components/ui/modals/OpenModal";
import { getServerTranslations } from "@/i18n/server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

type LoaderData = {
  title: string;
};
export const loader = async (props: IServerComponentsProps) => {
  const data: LoaderData = {
    title: `Webhooks | ${process.env.APP_NAME}`,
  };
  return data;
};

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

  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  const webhookAction = form.get("webhook-action")?.toString() ?? "";
  const method = form.get("webhook-method")?.toString() ?? "";
  const endpoint = form.get("webhook-endpoint")?.toString() ?? "";

  if (action === "create") {
    try {
      await db.entityWebhooks.createEntityWebhook({
        entityId: entity.id,
        action: webhookAction,
        method,
        endpoint,
      });
      return redirect(`/admin/entities/${params.entity}/webhooks`);
    } catch (e: any) {
      return badRequest({ error: e.message });
    }
  }
  return badRequest({ error: t("shared.invalidForm") });
};

export default function NewEntityWebhookRoute() {
  const params = useParams();
  const router = useRouter();
  function close() {
    router.push(`/admin/entities/${params.entity}/webhooks`);
  }
  return (
    <OpenModal className="sm:max-w-sm" onClose={close}>
      <EntityWebhookForm />
    </OpenModal>
  );
}
