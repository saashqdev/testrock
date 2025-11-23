import { Metadata } from "next";
import { getServerTranslations } from "@/i18n/server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import RolesAndPermissionsLayout from "./RolesAndPermissionsLayout";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslations();

  return {
    title: `${t("models.role.plural")} | ${process.env.APP_NAME}`,
  };
}

export default async function RolesAndPermissionsLayoutServer({ children }: { children: React.ReactNode }) {
  await verifyUserHasPermission("admin.roles.view");

  return <RolesAndPermissionsLayout>{children}</RolesAndPermissionsLayout>;
}
