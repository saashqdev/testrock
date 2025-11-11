import { Metadata } from "next";
import { getServerTranslations } from "@/i18n/server";
import NavigationClient from "./NavigationClient";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("admin.navigation.title")} | ${process.env.APP_NAME}`,
  };
}

export default async function AdminNavigationPage() {
  const { t } = await getServerTranslations();

  return <NavigationClient />;
}
