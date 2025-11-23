import { defaultSiteTags, getMetaTags } from "@/modules/pageBlocks/seo/SeoMetaTagsUtils";
import { getServerTranslations } from "@/i18n/server";
import { AnalyticsSettings } from "@prisma/client";
import { prisma } from "@/db/config/prisma/database";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { getBaseURL } from "@/utils/url.server";
import AdminAnalyticsSettingsClient from "./component";

type LoaderData = {
  settings: AnalyticsSettings;
  isLocalDev: boolean;
  serverUrl: string;
};

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return getMetaTags({
    title: `${t("analytics.settings")} | ${defaultSiteTags.title}`,
  });
}

async function getSettingsData(): Promise<LoaderData> {
  await verifyUserHasPermission("admin.analytics.view");
  let settings = await prisma.analyticsSettings.findFirst({});
  if (!settings) {
    settings = await prisma.analyticsSettings.create({
      data: { public: false, ignorePages: "/admin/analytics", onlyPages: "" },
    });
  }
  const serverUrl = await getBaseURL();
  const data: LoaderData = {
    settings,
    isLocalDev: process.env.NODE_ENV === "development",
    serverUrl,
  };
  return data;
}

export default async function AdminAnalyticsSettingsPage() {
  const data = await getSettingsData();

  return <AdminAnalyticsSettingsClient {...data} />;
}
