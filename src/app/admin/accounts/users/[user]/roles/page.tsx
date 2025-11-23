import { getDefaultSiteTags, defaultSeoMetaTags} from "@/modules/pageBlocks/pages/defaultSeoMetaTags";
import { getServerTranslations } from "@/i18n/server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { redirect } from "next/navigation";
import { db } from "@/db";
import Component from "./component";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return defaultSeoMetaTags({
    title: `${t("models.role.plural")} | ${getDefaultSiteTags.title}`,
  });
}

export default async function UserRolesPage(props: IServerComponentsProps) {
  await verifyUserHasPermission("admin.users.view");
  const params = (await props.params) || {};

  const users = await db.users.getUsersById([params.user]);
  const user = users[0];
  if (!user) {
    redirect("/admin/accounts/users");
  }

  const adminRoles = await db.roles.getAllRoles("admin");

  return <Component user={user} adminRoles={adminRoles} />;
}
