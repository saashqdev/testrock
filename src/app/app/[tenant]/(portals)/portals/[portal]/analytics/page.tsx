import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import { getTenantIdFromUrl } from "@/utils/services/server/urlService";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { db } from "@/db";
import UrlUtils from "@/utils/app/UrlUtils";
import PortalServer from "@/modules/portals/services/Portal.server";
import AnalyticsService from "@/lib/helpers/server/AnalyticsService";
import PeriodHelper from "@/lib/helpers/PeriodHelper";
import AnalyticsClient from "./analytics-client";

type Props = {
  params: Promise<{ tenant: string; portal: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("analytics.title")} | ${process.env.APP_NAME}`,
  };
}

export default async function AnalyticsPage({ params, searchParams }: Props) {
  await requireAuth();
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const appConfiguration = await db.appConfiguration.getAppConfiguration();
  if (!appConfiguration.portals?.analytics) {
    throw Response.json({ error: "Analytics are not enabled" }, { status: 400 });
  }

  const tenantId = await getTenantIdFromUrl(resolvedParams);
  const item = await db.portals.getPortalById(tenantId, resolvedParams.portal);

  if (!item) {
    redirect(UrlUtils.getModulePath(resolvedParams, "portals"));
  }

  const portalUrl = PortalServer.getPortalUrl(item);

  // Create a mock request for period helper
  const url = new URL(`http://localhost?${new URLSearchParams(resolvedSearchParams as any).toString()}`);
  const mockRequest = { url: url.toString() } as Request;

  const overview = await AnalyticsService.getAnalyticsOverview({
    withUsers: false,
    period: PeriodHelper.getPeriodFromRequest({ request: mockRequest }),
    portalId: item.id,
  });

  const data = {
    item: { ...item, portalUrl },
    overview,
  };

  return <AnalyticsClient data={data} />;
}
