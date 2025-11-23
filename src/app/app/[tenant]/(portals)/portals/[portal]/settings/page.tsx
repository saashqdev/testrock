import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import { getTenantIdFromUrl } from "@/utils/services/server/urlService";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { db } from "@/db";
import { PortalWithDetailsDto } from "@/db/models/portals/PortalsModel";
import UrlUtils from "@/utils/app/UrlUtils";
import PortalServer from "@/modules/portals/services/Portal.server";
import PortalSettingsClient from "./settings-client";

type Props = {
  params: Promise<{ tenant: string; portal: string }>;
};

type LoaderData = {
  item: PortalWithDetailsDto & { portalUrl?: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const { t } = await getServerTranslations();
  const tenantId = await getTenantIdFromUrl(resolvedParams);
  const item = await db.portals.getPortalById(tenantId, resolvedParams.portal);

  if (!item) {
    return {
      title: `${t("shared.settings")} | ${process.env.APP_NAME}`,
    };
  }

  return {
    title: `${t("shared.settings")} | ${item.title} | ${process.env.APP_NAME}`,
  };
}

export default async function PortalSettingsPage({ params }: Props) {
  await requireAuth();
  const resolvedParams = await params;
  const tenantId = await getTenantIdFromUrl(resolvedParams);
  const item: (PortalWithDetailsDto & { portalUrl?: string }) | null = await db.portals.getPortalById(tenantId, resolvedParams.portal);

  if (!item) {
    redirect(UrlUtils.getModulePath(resolvedParams, "portals"));
  }

  item.portalUrl = PortalServer.getPortalUrl(item);

  const data: LoaderData = {
    item,
  };

  return <PortalSettingsClient initialData={data} />;
}
