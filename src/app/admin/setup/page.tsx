import { Metadata } from "next";
import { getServerTranslations } from "@/i18n/server";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { getSetupSteps } from "@/utils/services/setupService";
import Component from "./component";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("app.sidebar.setup")} | ${process.env.APP_NAME}`,
  };
}

export default async function AdminSetupPage() {
  await requireAuth();
  const { t } = await getServerTranslations();
  const items = await getSetupSteps();

  return <Component t={t} items={items} />;
}
