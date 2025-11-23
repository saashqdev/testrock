import { getDefaultSiteTags } from "@/modules/pageBlocks/pages/defaultSeoMetaTags";
import { getServerTranslations } from "@/i18n/server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { db } from "@/db";
import Component from "./component";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("shared.new")} ${t("models.user.object")} | ${getDefaultSiteTags().title}`,
  };
}

export default async function NewUserPage() {
  await verifyUserHasPermission("admin.users.view");

  const adminRoles = await db.roles.getAllRoles("admin");

  return <Component adminRoles={adminRoles} />;
}
