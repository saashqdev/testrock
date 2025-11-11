import { redirect } from "next/navigation";
import { EntityGroupForm } from "@/components/entities/EntityGroupForm";
import { getServerTranslations } from "@/i18n/server";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { EntityViewsWithTenantAndUserDto } from "@/db/models/entityBuilder/EntityViewsModel";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

type LoaderData = {
  allEntities: EntityWithDetailsDto[];
  systemViews: EntityViewsWithTenantAndUserDto[];
};

async function getData(request: Request): Promise<LoaderData> {
  await verifyUserHasPermission("admin.entities.create");
  const data: LoaderData = {
    allEntities: await db.entities.getAllEntities(null),
    systemViews: (await db.entityViews.getAllEntityViews({ type: "system" })).items,
  };
  return data;
}

export const action = async (props: IServerComponentsProps) => {
  const request = props.request!;
  const { t } = await getServerTranslations();
  const form = await request.formData();
  const action = form.get("action")?.toString();

  if (action === "create") {
    await verifyUserHasPermission("admin.entities.create");
    const slug = form.get("slug")?.toString().trim() ?? "";
    const title = form.get("title")?.toString().trim() ?? "";
    const icon = form.get("icon")?.toString().trim() ?? "";
    const collapsible = Boolean(form.get("collapsible"));
    const section = form.get("section")?.toString() ?? null;
    const entities: { entityId: string; allViewId: string | null }[] = form.getAll("entities[]").map((f) => JSON.parse(f.toString()));
    const allGroups = await db.entityGroups.getAllEntityGroups();
    let maxOrder = 0;
    if (allGroups.length > 0) {
      maxOrder = Math.max(...allGroups.map((f) => f.order ?? 0));
    }
    const existing = allGroups.find((f) => f.slug.trim() === slug.trim());
    if (existing) {
      return Response.json({ error: "Group with this slug already exists" }, { status: 400 });
    }
    await db.entityGroups.createEntityGroup({
      order: maxOrder + 1,
      slug,
      title,
      icon,
      collapsible,
      section,
      entities,
    });
    return redirect("/admin/entities/groups");
  } else {
    return Response.json({ error: t("shared.invalidForm") }, { status: 400 });
  }
};

export default async function NewEntityGroupPage(props: IServerComponentsProps) {
  const request = props.request!;
  const data = await getData(request);

  return (
    <div>
      <EntityGroupForm item={undefined} allEntities={data.allEntities} systemViews={data.systemViews} />
    </div>
  );
}
