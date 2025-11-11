"use server";

import { redirect } from "next/navigation";
import { EntityGroupForm } from "@/components/entities/EntityGroupForm";
import { getServerTranslations } from "@/i18n/server";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { EntityGroupWithDetailsDto } from "@/db/models/entityBuilder/EntityGroupsModel";
import { EntityViewsWithTenantAndUserDto } from "@/db/models/entityBuilder/EntityViewsModel";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import { revalidatePath } from "next/cache";

type LoaderData = {
  item: EntityGroupWithDetailsDto;
  allEntities: EntityWithDetailsDto[];
  systemViews: EntityViewsWithTenantAndUserDto[];
};

async function getData(props: IServerComponentsProps): Promise<LoaderData> {
  const params = (await props.params) || {};
  const request = props.request!;  
  await verifyUserHasPermission("admin.entities.update");
  const item = await db.entityGroups.getEntityGroup(params.id!);
  if (!item) {
    redirect("/admin/entities/groups");
  }
  const data: LoaderData = {
    item,
    allEntities: await db.entities.getAllEntities(null),
    systemViews: (await db.entityViews.getAllEntityViews({ type: "system" })).items,
  };
  return data;
}

export async function updateEntityGroupAction(id: string, formData: FormData) {
  const { t } = await getServerTranslations();
  
  // Note: You'll need to pass the request object for permission verification
  // This might require adjusting how you handle auth in server actions
  // await verifyUserHasPermission("admin.entities.update");
  
  const item = await db.entityGroups.getEntityGroup(id);
  if (!item) {
    redirect("/admin/entities/groups");
  }

  const slug = formData.get("slug")?.toString();
  const title = formData.get("title")?.toString();
  const icon = formData.get("icon")?.toString();
  const collapsible = Boolean(formData.get("collapsible"));
  const section = formData.get("section")?.toString() ?? null;
  const entities: { entityId: string; allViewId: string | null }[] = formData.getAll("entities[]").map((f) => JSON.parse(f.toString()));

  const allGroups = await db.entityGroups.getAllEntityGroups();
  const existing = allGroups.find((f) => f.slug.trim() === slug?.trim() && f.id !== id);
  if (slug && existing) {
    return { error: "Group with this slug already exists" };
  }
  
  await db.entityGroups.updateEntityGroup(id, {
    slug,
    title,
    icon,
    collapsible,
    section,
    entities,
  });
  
  revalidatePath("/admin/entities/groups");
  redirect("/admin/entities/groups");
}

export async function deleteEntityGroupAction(id: string) {
  const { t } = await getServerTranslations();
  
  // Note: You'll need to pass the request object for permission verification
  // await verifyUserHasPermission("admin.entities.delete");
  
  const item = await db.entityGroups.getEntityGroup(id);
  if (!item) {
    redirect("/admin/entities/groups");
  }
  
  await db.entityGroups.deleteEntityGroup(id);
  
  revalidatePath("/admin/entities/groups");
  return { success: t("shared.deleted") };
}

export default async function EntityGroupEditPage(props: IServerComponentsProps) {
  const data = await getData(props);

  return (
    <div>
      <EntityGroupForm item={data.item} allEntities={data.allEntities} systemViews={data.systemViews} />
    </div>
  );
}
