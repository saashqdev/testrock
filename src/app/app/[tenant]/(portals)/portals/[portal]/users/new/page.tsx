import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import { getTenantIdFromUrl } from "@/utils/services/server/urlService";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { db } from "@/db";
import UrlUtils from "@/utils/app/UrlUtils";
import NewUserClient from "./new-user-client";
import { Metadata } from "next";

type Props = {
  params: Promise<{ tenant: string; portal: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("shared.new")} ${t("models.user.object")} | ${process.env.APP_NAME}`,
  };
}

export default async function NewUserPage({ params }: Props) {
  await requireAuth();
  const resolvedParams = await params;
  const tenantId = await getTenantIdFromUrl(resolvedParams);
  const portal = await db.portals.getPortalById(tenantId, resolvedParams.portal);

  if (!portal) {
    redirect(UrlUtils.getModulePath(resolvedParams, "portals"));
  }

  return <NewUserClient portalId={portal.id} />;
}
