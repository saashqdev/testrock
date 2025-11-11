import { redirect } from "next/navigation";
import EntityRelationshipForm from "@/components/entities/relationships/EntityRelationshipForm";
import { getServerTranslations } from "@/i18n/server";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { EntityRelationshipWithCountDto } from "@/db/models/entityBuilder/EntityRelationshipsModel";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

type LoaderData = {
  entity: EntityWithDetailsDto;
  entities: EntityWithDetailsDto[];
  item: EntityRelationshipWithCountDto;
};
export const loader = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const request = props.request!;
  await verifyUserHasPermission("admin.entities.view");
  const entity = await db.entities.getEntityBySlug({ tenantId: null, slug: params.entity! });
  const item = await db.entityRelationships.getEntityRelationship(params.id ?? "");
  if (!item) {
    return redirect(`/admin/entities/${params.entity}/relationships`);
  }
  const data: LoaderData = {
    entity,
    entities: await db.entities.getAllEntities(null),
    item,
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
  // const entity = await getEntityBySlug({ tenantId: null, slug: params.entity! });
  let existing = await db.entityRelationships.getEntityRelationship(params.id ?? "");
  if (!existing) {
    return badRequest({ error: t("shared.notFound") });
  }

  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  // const order = Number(form.get("order"));
  let title = form.get("title")?.toString() ?? null;
  const type = form.get("relationshipType")?.toString() ?? "one-to-many";
  const required = Boolean(form.get("required"));
  const cascade = Boolean(form.get("cascade"));
  const readOnly = Boolean(form.get("readOnly"));
  const hiddenIfEmpty = Boolean(form.get("hiddenIfEmpty"));
  const childEntityViewId = form.get("childEntityViewId")?.toString() ?? null;
  const parentEntityViewId = form.get("parentEntityViewId")?.toString() ?? null;

  if (title?.trim() === "") {
    title = null;
  }
  if (action === "edit") {
    existing = await db.entityRelationships.findEntityRelationship({ parentId: existing.parentId, childId: existing.childId, title, notIn: [existing.id] });
    if (existing) {
      return badRequest({ error: "Relationship already exists" });
    }
    try {
      await db.entityRelationships.updateEntityRelationship(params.id ?? "", {
        // order,
        title,
        type,
        required,
        cascade,
        readOnly,
        hiddenIfEmpty,
        childEntityViewId: childEntityViewId?.length ? childEntityViewId : null,
        parentEntityViewId: parentEntityViewId?.length ? parentEntityViewId : null,
      });
      return redirect(`/admin/entities/${params.entity}/relationships`);
    } catch (e: any) {
      return badRequest({ error: e.message });
    }
  } else if (action === "delete") {
    await verifyUserHasPermission("admin.entities.delete");
    if (existing._count.rows > 0) {
      return badRequest({ error: "You cannot delete a relationship that has rows: " + existing.id });
    }
    await db.entityRelationships.deleteEntityRelationship(existing.id);
    return redirect(`/admin/entities/${params.entity}/relationships`);
  }
  return badRequest({ error: t("shared.invalidForm") });
};

export default async function EditEntityRelationshipRoute(props: IServerComponentsProps) {
  const data = await loader(props);
  return (
    <div>
      <EntityRelationshipForm entity={data.entity} entities={data.entities} item={data.item} />
    </div>
  );
}
