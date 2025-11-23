import { EntityRelationshipWithDetailsDto } from "@/db/models/entityBuilder/EntityRelationshipsModel";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import { getServerTranslations } from "@/i18n/server";
import EditEntityRelationshipsClient from "./RelationshipsClient";

type LoaderData = {
  items: (EntityRelationshipWithDetailsDto & { _count: { rows: number } })[];
};

async function loader(props: IServerComponentsProps) {
  const params = (await props.params) || {};
  await verifyUserHasPermission("admin.entities.view");
  const entity = await db.entities.getEntityBySlug({ tenantId: null, slug: params.entity ?? "" });
  const items = await db.entityRelationships.getEntityRelationshipsWithCount(entity.id);
  const data: LoaderData = {
    items,
  };
  return data;
}

export const action = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const request = props.request!;
  await verifyUserHasPermission("admin.entities.update");
  const { t } = await getServerTranslations();

  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";

  if (action === "set-orders") {
    const items: { id: string; order: number }[] = form.getAll("orders[]").map((f: FormDataEntryValue) => {
      return JSON.parse(f.toString());
    });

    await Promise.all(
      items.map(async ({ id, order }) => {
        await db.entityRelationships.updateEntityRelationship(id, { order: Number(order) });
      })
    );
    return Response.json({ updated: true });
  }
  return Response.json({ error: t("shared.invalidForm") }, { status: 400 });
};

export default async function EditEntityRelationshipsRoute(props: IServerComponentsProps) {
  const data = await loader(props);

  return <EditEntityRelationshipsClient items={data.items} />;
}
