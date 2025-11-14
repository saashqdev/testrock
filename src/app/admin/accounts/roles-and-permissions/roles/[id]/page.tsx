import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import { PermissionsWithRolesDto } from "@/db/models/permissions/PermissionsModel";
import { RoleWithPermissionsDto } from "@/db/models/permissions/RolesModel";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import { Metadata } from "next";
import RoleEditView from "@/app/admin/accounts/roles-and-permissions/roles/[id]/component";

type LoaderData = {
  title: string;
  item: RoleWithPermissionsDto;
  permissions: PermissionsWithRolesDto[];
};

export const loader = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  await verifyUserHasPermission("admin.roles.update");
  const { t } = await getServerTranslations();

  const item = await db.roles.getRole(params.id ?? "");
  if (!item) {
    throw redirect("/admin/accounts/roles-and-permissions/roles");
  }
  const permissions = await db.permissions.getAllPermissions();
  const data: LoaderData = {
    title: `${item.name} | ${t("models.role.object")} | ${process.env.APP_NAME}`,
    item,
    permissions,
  };
  return data;
};

type ActionData = {
  success?: string;
  error?: string;
};
const badRequest = (data: ActionData) => Response.json(data, { status: 400 });
export const action = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const request = props.request!;
  await verifyUserHasPermission("admin.roles.update");
  const { t } = await getServerTranslations();

  const existing = await db.roles.getRole(params.id ?? "");
  if (!existing) {
    return redirect("/admin/accounts/roles-and-permissions/roles");
  }

  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  if (action === "edit") {
    await verifyUserHasPermission("admin.roles.update");
    const name = form.get("name")?.toString() ?? "";
    const description = form.get("description")?.toString() ?? "";
    const assignToNewUsers = Boolean(form.get("assign-to-new-users"));
    const type: "admin" | "app" = form.get("type")?.toString() === "admin" ? "admin" : "app";
    const permissions = form.getAll("permissions[]").map((f) => f.toString());
    const data = {
      name,
      description,
      assignToNewUsers,
      type,
    };
    try {
      await db.roles.updateRole(existing.id, data);
      await db.rolePermissions.setRolePermissions(existing.id, permissions);
      db.logs.createAdminLog(
        request,
        "Updated",
        `${existing.name}: ${JSON.stringify({
          ...data,
          permissions,
        })}`
      );
      return Response.json({ success: t("shared.updated") });
    } catch (e: any) {
      return Response.json({ error: e.message }, { status: 400 });
    }
  } else if (action === "delete") {
    await verifyUserHasPermission("admin.roles.delete");
    await db.roles.deleteRole(existing.id);
    db.logs.createAdminLog(request, "Deleted", `${existing.name}`);
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }
  return redirect("/admin/accounts/roles-and-permissions/roles");
};

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await loader(props);
  return { title: data.title };
}

export default async function AdminEditRoleRoute(props: IServerComponentsProps) {
  const data = await loader(props);
  return <RoleEditView item={data.item} permissions={data.permissions} />;
}
