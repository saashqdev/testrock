import { NextRequest, NextResponse } from "next/server";
import { getServerTranslations } from "@/i18n/server";
import { createMetrics } from "@/modules/metrics/services/server/MetricTracker";
import TenantHelper from "@/lib/helpers/TenantHelper";
import { getActiveTenantSubscriptions } from "@/utils/services/server/subscriptionService";
import { db } from "@/db";

// GET /api/accounts
export async function GET(request: NextRequest) {
  const { t } = await getServerTranslations();
  const { time, getServerTimingHeader } = await createMetrics({ request, params: {} }, "[Accounts_API_GET]");
  const apiKeyFromHeaders = request.headers.get("X-Api-Key") ?? "";

  try {
    if (!process.env.API_ACCESS_TOKEN || apiKeyFromHeaders !== process.env.API_ACCESS_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenants = await time(db.tenants.adminGetAllTenants(), "adminGetAllTenants");
    const tenantSettingsEntity = await db.entities.findEntityByName({ tenantId: null, name: "tenantSettings" });
    const data = await Promise.all(
      tenants.map(async (tenant) => {
        const subscriptions = await getActiveTenantSubscriptions(tenant.id);
        return TenantHelper.apiFormat({ tenant, subscriptions, tenantSettingsEntity, t });
      })
    );

    return NextResponse.json(
      {
        success: true,
        total_results: data.length,
        data,
      },
      { headers: getServerTimingHeader() }
    );
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error({ error: e.message });
    return NextResponse.json({ error: e.message }, { status: 400, headers: getServerTimingHeader() });
  }
}
