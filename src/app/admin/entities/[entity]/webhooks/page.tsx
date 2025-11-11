import { redirect } from "next/navigation";
import ButtonTertiary from "@/components/ui/buttons/ButtonTertiary";
import TableSimple from "@/components/ui/tables/TableSimple";
import { EntityWebhookWithDetailsDto } from "@/db/models/entityBuilder/EntityWebhooksModel";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import { getServerTranslations } from "@/i18n/server";

type LoaderData = {
  items: EntityWebhookWithDetailsDto[];
};

async function loader(props: IServerComponentsProps): Promise<LoaderData> {
  const params = (await props.params) || {};
  await verifyUserHasPermission("admin.entities.view");
  const entity = await db.entities.getEntityBySlug({ tenantId: null, slug: params.entity ?? "" });
  if (!entity) {
    redirect("/admin/entities");
  }
  const items = await db.entityWebhooks.getEntityWebhooks(entity.id);
  return {
    items,
  };
}

export default async function EditEntityWebhooksRoute(props: IServerComponentsProps) {
  const data = await loader(props);
  const { t } = await getServerTranslations();

  return (
    <div className="space-y-3">
      <h3 className="text-foreground text-sm font-medium leading-3">Webhooks</h3>
      <TableSimple
        headers={[
          {
            title: "Action",
            name: "action",
            value: (item) => item.action,
          },
          {
            title: "Method",
            name: "method",
            value: (item) => item.method,
          },
          {
            title: "Endpoint",
            name: "endpoint",
            value: (item) => item.endpoint,
          },
        ]}
        items={data.items}
      />
      <div className="flex justify-start">
        <ButtonTertiary to="new">
          <span className="font-medium uppercase">{t("shared.add")}</span>
        </ButtonTertiary>
      </div>
    </div>
  );
}
