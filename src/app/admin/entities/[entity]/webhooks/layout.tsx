import { redirect } from "next/navigation";
import ButtonTertiary from "@/components/ui/buttons/ButtonTertiary";
import { EntityWebhookWithDetailsDto } from "@/db/models/entityBuilder/EntityWebhooksModel";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import { getServerTranslations } from "@/i18n/server";
import WebhooksTable from "./WebhooksTable";

type LoaderData = {
  items: EntityWebhookWithDetailsDto[];
};
async function loader(props: IServerComponentsProps) {
  const params = (await props.params) || {};
  const request = props.request!;
  await verifyUserHasPermission("admin.entities.view");
  const entity = await db.entities.getEntityBySlug({ tenantId: null, slug: params.entity ?? "" });
  if (!entity) {
    return redirect("/admin/entities");
  }
  const items = await db.entityWebhooks.getEntityWebhooks(entity.id);
  const data: LoaderData = {
    items,
  };
  return data;
}

export default async function EditEntityIndexRoute(props: IServerComponentsProps) {
  const data = await loader(props);
  const { t } = await getServerTranslations();

  return (
    <>
      <div className="space-y-3">
        <h3 className="text-sm font-medium leading-3 text-foreground">Webhooks</h3>
        <WebhooksTable items={data.items} withActions={true} showAddButton={true} />
      </div>
    </>
  );
}
