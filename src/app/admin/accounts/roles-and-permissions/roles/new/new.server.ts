import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import { PermissionsWithRolesDto } from "@/db/models/permissions/PermissionsModel";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

export type LoaderData = {
  title: string;
  permissions: PermissionsWithRolesDto[];
};

export const loader = async (props: IServerComponentsProps): Promise<LoaderData> => {
  await verifyUserHasPermission("admin.roles.create");
  const { t } = await getServerTranslations();

  const permissions = await db.permissions.getAllPermissions();
  const data: LoaderData = {
    title: `${t("models.role.object")} | ${process.env.APP_NAME}`,
    permissions,
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
  const action = form.get("action")?.toString() ?? "";
  if (action === "create") {
    const name = form.get("name")?.toString() ?? "";
    const description = form.get("description")?.toString() ?? "";
    const assignToNewUsers = Boolean(form.get("assign-to-new-users"));
    const type: "admin" | "app" = form.get("type")?.toString() === "admin" ? "admin" : "app";
    const permissions = form.getAll("permissions[]").map((f) => f.toString());

    const existing = await db.roles.getRoleByName(name);
    if (existing) {
      return badRequest({ error: "Existing role with name: " + name });
    }

    const order = await db.roles.getNextRolesOrder(type);
    const data = {
      order,
      name,
      description,
      assignToNewUsers,
      type,
      isDefault: false,
    };
    const role = await db.roles.createRole(data);
    await db.rolePermissions.setRolePermissions(role.id, permissions);
    db.logs.createAdminLog(
      request,
      "Create",
      `${JSON.stringify({
        ...data,
        permissions,
      })}`
    );
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }
  return redirect("/admin/accounts/roles-and-permissions/roles");
};

