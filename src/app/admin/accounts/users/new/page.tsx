import { defaultSiteTags, getMetaTags } from "@/modules/pageBlocks/seo/SeoMetaTagsUtils";
import { getServerTranslations } from "@/i18n/server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { db } from "@/db";
import Component from "./component";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return getMetaTags({
    title: `${t("shared.new")} ${t("models.user.object")} | ${defaultSiteTags.title}`,
  });
}

export default async function NewUserPage() {
  await verifyUserHasPermission("admin.users.view");
  
  const adminRoles = await db.roles.getAllRoles("admin");
  
  return <Component adminRoles={adminRoles} />;
}
