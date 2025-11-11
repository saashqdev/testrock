import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import { getTenantIdFromUrl } from "@/utils/services/server/urlService";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { db } from "@/db";
import { PortalWithDetailsDto } from "@/db/models/portals/PortalsModel";
import UrlUtils from "@/utils/app/UrlUtils";
import PortalServer from "@/modules/portals/services/Portal.server";
import { prisma } from "@/db/config/prisma/database";
import PortalOverviewClient from "./portal-overview-client";

type Props = {
  params: Promise<{ tenant: string; portal: string }>;
};

type LoaderData = {
  item: PortalWithDetailsDto & { portalUrl?: string };
  overview: {
    users: number;
    visitors: number;
    products: number;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const { t } = await getServerTranslations();
  const tenantId = await getTenantIdFromUrl(resolvedParams);
  const item = await db.portals.getPortalById(tenantId, resolvedParams.portal);
  
  if (!item) {
    return {
      title: `${t("models.portal.object")} | ${process.env.APP_NAME}`,
    };
  }

  return {
    title: `${item.title} | ${t("models.portal.plural")} | ${process.env.APP_NAME}`,
  };
}

export default async function PortalOverviewPage({ params }: Props) {
  await requireAuth();
  const { t } = await getServerTranslations();
  const resolvedParams = await params;
  const tenantId = await getTenantIdFromUrl(resolvedParams);
  const item: (PortalWithDetailsDto & { portalUrl?: string }) | null = await db.portals.getPortalById(tenantId, resolvedParams.portal);
  
  if (!item) {
    redirect(UrlUtils.getModulePath(resolvedParams, "portals"));
  }
  
  item.portalUrl = PortalServer.getPortalUrl(item);

  const overview = {
    users: await prisma.portalUser.count({ where: { portalId: item.id } }),
    visitors: await prisma.analyticsUniqueVisitor.count({ where: { portalId: item.id } }),
    products: await prisma.portalSubscriptionProduct.count({ where: { portalId: item.id } }),
  };

  const data: LoaderData = {
    item,
    overview,
  };

  return <PortalOverviewClient data={data} />;
}
