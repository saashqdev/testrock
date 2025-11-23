"use server";

import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import { db } from "@/db";

export async function createEntityRelationship(entitySlug: string, formData: FormData) {
  const { t } = await getServerTranslations();

  const entity = await db.entities.getEntityBySlug({ tenantId: null, slug: entitySlug });
  if (!entity) {
    return { error: "Entity not found" };
  }

  const action = formData.get("action")?.toString() ?? "";
  const parentId = formData.get("parentId")?.toString() ?? entity.id;
  const childId = formData.get("childId")?.toString() ?? entity.id;
  let title = formData.get("title")?.toString().trim() ?? null;
  const type = formData.get("relationshipType")?.toString() ?? "one-to-many";
  const required = Boolean(formData.get("required"));
  const cascade = Boolean(formData.get("cascade"));
  const readOnly = Boolean(formData.get("readOnly"));
  const hiddenIfEmpty = Boolean(formData.get("hiddenIfEmpty"));
  const childEntityViewId = formData.get("childEntityViewId")?.toString() ?? null;
  const parentEntityViewId = formData.get("parentEntityViewId")?.toString() ?? null;

  if (title?.trim() === "") {
    title = null;
  }

  if (action === "create") {
    const existing = await db.entityRelationships.findEntityRelationship({ parentId, childId, title });
    if (existing) {
      return { error: "Relationship already exists" };
    }

    const allRelationships = await db.entityRelationships.getEntityRelationships(entity.id);
    let maxOrder = 0;
    if (allRelationships.length > 0) {
      maxOrder = Math.max(...allRelationships.map((f) => f.order ?? 0));
    }

    try {
      await db.entityRelationships.createEntityRelationship({
        parentId,
        childId,
        order: maxOrder + 1,
        title,
        type,
        required,
        cascade,
        readOnly,
        hiddenIfEmpty,
        childEntityViewId: childEntityViewId?.length ? childEntityViewId : null,
        parentEntityViewId: parentEntityViewId?.length ? parentEntityViewId : null,
      });

      redirect(`/admin/entities/${entitySlug}/relationships`);
    } catch (e: any) {
      return { error: e.message };
    }
  }

  return { error: t("shared.invalidForm") };
}
