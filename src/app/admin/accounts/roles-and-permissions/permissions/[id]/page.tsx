import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import { PermissionsWithRolesDto } from "@/db/models/permissions/PermissionsModel"; 
import { RoleWithPermissionsDto } from "@/db/models/permissions/RolesModel";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import { Metadata } from "next";
import PermissionEditView from "./component";

type LoaderData = {
  title: string;
  item: PermissionsWithRolesDto;
  roles: RoleWithPermissionsDto[];
};

export const loader = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  await verifyUserHasPermission("admin.roles.view");
  const { t } = await getServerTranslations();

  const item = await db.permissions.getPermission(params.id ?? "");
  if (!item) {
    redirect("/admin/accounts/roles-and-permissions/permissions");
  }
  const roles = await db.roles.getAllRoles();
  const data: LoaderData = {
    title: `${item.name} | ${t("models.permission.object")} | ${process.env.APP_NAME}`,
    item,
    roles,
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
  await verifyUserHasPermission("admin.roles.update");
  const { t } = await getServerTranslations();

  const existing = await db.permissions.getPermission(params.id ?? "");
  if (!existing) {
    return redirect("/admin/accounts/roles-and-permissions/permissions");
  }

  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  if (action === "edit") {
    const name = form.get("name")?.toString() ?? "";
    const description = form.get("description")?.toString() ?? "";
    const type: "admin" | "app" = form.get("type")?.toString() === "admin" ? "admin" : "app";
    const roles = form.getAll("roles[]").map((f) => f.toString());
    const data = {
      name,
      description,
      type,
    };
    await db.permissions.updatePermission(existing.id, data);
    await db.rolePermissions.setPermissionRoles(existing.id, roles);
    db.logs.createAdminLog(
      request,
      "Updated",
      `${existing.name}: ${JSON.stringify({
        ...data,
        roles,
      })}`
    );
  } else if (action === "delete") {
    await verifyUserHasPermission("admin.roles.delete");
    await db.permissions.deletePermission(existing.id);
    db.logs.createAdminLog(request, "Deleted", `${existing.name}`);
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }
  return redirect("/admin/accounts/roles-and-permissions/permissions");
};

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await loader(props);
  return { title: data.title };
}

export default async function AdminEditPermissionRoute(props: IServerComponentsProps) {
  const data = await loader(props);
  return <PermissionEditView item={data.item} roles={data.roles} />;
}
