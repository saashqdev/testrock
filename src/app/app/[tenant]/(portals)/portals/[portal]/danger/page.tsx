import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import { getTenantIdFromUrl } from "@/utils/services/server/urlService";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { db } from "@/db";
import UrlUtils from "@/utils/app/UrlUtils";
import PortalServer from "@/modules/portals/services/Portal.server";
import DangerClient from "./danger-client";

type Props = {
  params: Promise<{ tenant: string; portal: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("models.portal.danger")} | ${process.env.APP_NAME}`,
  };
}

export default async function DangerPage({ params }: Props) {
  await requireAuth();
  const resolvedParams = await params;
  const tenantId = await getTenantIdFromUrl(resolvedParams);
  const item = await db.portals.getPortalById(tenantId, resolvedParams.portal);
  
  if (!item) {
    redirect(UrlUtils.getModulePath(resolvedParams, "portals"));
  }
  
  const portalUrl = PortalServer.getPortalUrl(item);
  
  const data = {
    item: { ...item, portalUrl },
  };

  return <DangerClient data={data} />;
}
