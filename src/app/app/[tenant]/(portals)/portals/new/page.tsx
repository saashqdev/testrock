import { Metadata } from "next";
import { getServerTranslations } from "@/i18n/server";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { db } from "@/db";
import NewPortalClient from "./new-portal-client";

type Props = {
  params: Promise<{ tenant: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("shared.new")} ${t("models.portal.object")} | ${process.env.APP_NAME}`,
  };
}

export default async function NewPortalPage({ params }: Props) {
  await requireAuth();
  const { t } = await getServerTranslations();
  const appConfiguration = await db.appConfiguration.getAppConfiguration();
  
  if (!appConfiguration.portals?.enabled) {
    throw Response.json({ error: "Portals are not enabled" }, { status: 400 });
  }
  
  return <NewPortalClient />;
}
