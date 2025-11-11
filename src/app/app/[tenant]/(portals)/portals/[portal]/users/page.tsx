import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import { getTenantIdFromUrl } from "@/utils/services/server/urlService";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { db } from "@/db";
import UrlUtils from "@/utils/app/UrlUtils";
import UsersClient from "./users-client";
import { Metadata } from "next";

type Props = {
  params: Promise<{ tenant: string; portal: string }>;
  children?: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const { t } = await getServerTranslations();
  const tenantId = await getTenantIdFromUrl(resolvedParams);
  const item = await db.portals.getPortalById(tenantId, resolvedParams.portal);
  
  if (!item) {
    return {
      title: `${t("models.user.plural")} | ${process.env.APP_NAME}`,
    };
  }

  return {
    title: `${t("models.user.plural")} | ${item.title} | ${process.env.APP_NAME}`,
  };
}

export default async function UsersPage({ params, children }: Props) {
  await requireAuth();
  const { t } = await getServerTranslations();
  const resolvedParams = await params;
  const tenantId = await getTenantIdFromUrl(resolvedParams);
  const item = await db.portals.getPortalById(tenantId, resolvedParams.portal);
  
  if (!item) {
    redirect(UrlUtils.getModulePath(resolvedParams, "portals"));
  }
  
  const items = await db.portalUsers.getPortalUsers(item.id);
  
  const data = {
    metatags: [{ title: `${t("models.user.plural")} | ${item.title} | ${process.env.APP_NAME}` }],
    item,
    items,
  };

  return <UsersClient data={data} children={children} />;
}
