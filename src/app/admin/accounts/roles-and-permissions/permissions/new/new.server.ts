import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import { RoleWithPermissionsDto } from "@/db/models/permissions/RolesModel";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

export type LoaderData = {
  title: string;
  roles: RoleWithPermissionsDto[];
};

export const loader = async (props: IServerComponentsProps): Promise<LoaderData> => {
  await verifyUserHasPermission("admin.roles.create");
  const { t } = await getServerTranslations();

  const roles = await db.roles.getAllRoles();
  const data: LoaderData = {
    title: `${t("models.permission.object")} | ${process.env.APP_NAME}`,
    roles,
  };
  return data;
};

type ActionData = {
  error?: string;
};

const badRequest = (data: ActionData) => Response.json(data, { status: 400 });

export const action = async (props: IServerComponentsProps) => {
  const request = props.request!;
  await verifyUserHasPermission("admin.roles.create");
  const { t } = await getServerTranslations();

  const form = await request.formData();
  const actionType = form.get("action")?.toString() ?? "";
  if (actionType === "create") {
    const name = form.get("name")?.toString() ?? "";
    const description = form.get("description")?.toString() ?? "";
    const type: "admin" | "app" = form.get("type")?.toString() === "admin" ? "admin" : "app";
    const roles = form.getAll("roles[]").map((f) => f.toString());

    const existing = await db.permissions.getPermissionName(name);
    if (existing) {
      return badRequest({ error: "Existing permission with name: " + name });
    }

    const order = await db.permissions.getNextPermissionsOrder(type);
    const data = {
      order,
      name,
      description,
      type,
      isDefault: false,
      entityId: null,
    };
    const permission = await db.permissions.createPermission(data);
    await db.rolePermissions.setPermissionRoles(permission.id, roles);
    db.logs.createAdminLog(
      request,
      "Created",
      `${JSON.stringify({
        ...data,
        roles,
      })}`
    );
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }
  return redirect("/admin/accounts/roles-and-permissions/permissions");
};

