import { Metadata } from "next";
import { getServerTranslations } from "@/i18n/server";
import { RoleWithPermissionsDto } from "@/db/models/permissions/RolesModel";
import { UserWithDetailsDto } from "@/db/models/accounts/UsersModel";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import AdminUsersClient from "./component";
import { revalidatePath } from "next/cache";

type LoaderData = {
  title: string;
  items: UserWithDetailsDto[];
  roles: RoleWithPermissionsDto[];
};

async function getData(props: IServerComponentsProps): Promise<LoaderData> {
  await verifyUserHasPermission("admin.roles.update");
  const { t } = await getServerTranslations();

  const items = (await db.users.adminGetAllUsers()).items.filter((f) => f.admin);
  const roles = await db.roles.getAllRoles("admin");

  const data: LoaderData = {
    title: `${t("models.role.adminRoles")} | ${process.env.APP_NAME}`,
    items,
    roles,
  };
  return data;
}

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const { t } = await getServerTranslations();
  
  return {
    title: `${t("models.role.adminRoles")} | ${process.env.APP_NAME}`,
  };
}

async function updateUserRole(formData: FormData) {
  "use server";
  
  await verifyUserHasPermission("admin.roles.update");
  const { t } = await getServerTranslations();

  const action = formData.get("action")?.toString() ?? "";
  
  if (action === "edit") {
    const userId = formData.get("user-id")?.toString() ?? "";
    const roleId = formData.get("role-id")?.toString() ?? "";
    const add = formData.get("add") === "true";

    const user = await db.users.getUser(userId);
    const role = await db.roles.getRole(roleId);

    // Create a mock request for logging purposes
    const request = new Request("http://localhost", {
      method: "POST",
    });

    if (add) {
      await db.userRoles.createUserRole(userId, roleId);
      db.logs.createAdminLog(request, "Created", `${user?.email} - ${role?.name}}`);
    } else {
      await db.userRoles.deleteUserRole(userId, roleId);
      db.logs.createAdminLog(request, "Deleted", `${user?.email} - ${role?.name}}`);
    }
  }
  
  // Revalidate the current page to refresh the data
  revalidatePath("/admin/accounts/roles-and-permissions/admin-users");
}

export default async function AdminUsersPage(props: IServerComponentsProps) {
  const data = await getData(props);
  return <AdminUsersClient data={data} updateUserRole={updateUserRole} />;
}
