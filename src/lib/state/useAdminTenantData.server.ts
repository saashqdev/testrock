"server-only";

import { db } from "@/db";
import { getServerTranslations } from "@/i18n/server";

export type AdminTenantLoaderData = {
  title: string;
  tenant: any | null;
};

export async function loadAdminTenantData(request: Request, id?: string) {
  const { t } = await getServerTranslations();
  const tenant = await db.tenants.getTenantWithUsers(id);
  const data: AdminTenantLoaderData = {
    title: `${t("models.tenant.object")} | ${process.env.APP_NAME}`,
    tenant,
  };
  return data;
}
