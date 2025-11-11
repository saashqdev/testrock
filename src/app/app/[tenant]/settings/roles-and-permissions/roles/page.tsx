import { Metadata } from "next";
import { getServerTranslations } from "@/i18n/server";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { db } from "@/db";
import RolesComponent from "./component";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslations();
  
  return {
    title: `${t("models.role.plural")} | ${process.env.APP_NAME}`,
  };
}

export default async function RolesRoute() {
  await requireAuth();
  
  const items = await db.roles.getAllRolesWithUsers("app");

  return <RolesComponent items={items} />;
}
