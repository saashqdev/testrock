"server-only";

import { db } from "@/db";
import { Params } from "@/types";
import { getTenantIdFromUrl } from "@/utils/services/server/urlService";

export type DashboardLoaderData = {
  users: number;
};

export async function loadDashboardData({ request, params }: { request: Request; params: Params }): Promise<DashboardLoaderData> {
  const tenantId = await getTenantIdFromUrl(params);
  const data: DashboardLoaderData = {
    users: await db.tenants.getTenantUsersCount(tenantId),
  };
  return data;
}
