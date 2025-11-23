import { PortalWithCountDto } from "@/db/models/portals/PortalsModel";
import { getTenantIdFromUrl } from "@/utils/services/server/urlService";
import PortalServer from "@/modules/portals/services/Portal.server";
import { prisma } from "@/db/config/prisma/database";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { db } from "@/db";
import PortalsClient from "./portals-client";
import { Metadata } from "next";
import { getServerTranslations } from "@/i18n/server";

type PortalWithCounts = PortalWithCountDto & {
  portalUrl?: string;
  _count: {
    users: number;
    subscriptionProducts: number;
    visitors?: number;
  };
};

type LoaderData = {
  items: PortalWithCounts[];
  error?: string;
};

type Props = {
  params: Promise<{ tenant: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("models.portal.plural")} | ${process.env.APP_NAME}`,
  };
}

async function getData(params: { tenant: string }): Promise<LoaderData> {
  await requireAuth();
  const appConfiguration = await db.appConfiguration.getAppConfiguration();
  const config = appConfiguration.portals;
  if (!config?.enabled) {
    throw Response.json({ error: "Portals are not enabled" }, { status: 400 });
  }
  if (!config?.forTenants) {
    throw Response.json({ error: "You don't have access to this feature" }, { status: 403 });
  }
  if (!process.env.PORTAL_SERVER_URL) {
    return {
      items: [],
      error: "Portal server URL is not configured. Please set the PORTAL_SERVER_URL environment variable.",
    };
  }
  const tenantId = await getTenantIdFromUrl(params);
  const items: PortalWithCounts[] = await db.portals.getAllTenantPortals({ tenantId });
  for (const item of items) {
    try {
      item.portalUrl = PortalServer.getPortalUrl(item);
    } catch (error) {
      // If PORTAL_SERVER_URL is not set and the portal doesn't have a custom domain,
      // we can't generate a URL - this will be shown as an error in the UI
      item.portalUrl = undefined;
    }
    item._count = {
      ...item._count,
      visitors: await prisma.analyticsUniqueVisitor.count({ where: { portalId: item.id } }),
    };
  }
  const data: LoaderData = {
    items,
  };
  return data;
}

export default async function PortalsPage({ params }: Props) {
  const resolvedParams = await params;
  const data = await getData(resolvedParams);

  return <PortalsClient data={data} />;
}
