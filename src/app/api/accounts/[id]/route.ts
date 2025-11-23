import { NextRequest, NextResponse } from "next/server";
import invariant from "tiny-invariant";
import { getServerTranslations } from "@/i18n/server";
import { createMetrics } from "@/modules/metrics/services/server/MetricTracker";
import TenantHelper from "@/lib/helpers/TenantHelper";
import { getActiveTenantSubscriptions } from "@/utils/services/server/subscriptionService";
import { db } from "@/db";

// GET /api/accounts/:id
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { t } = await getServerTranslations();
  const { time, getServerTimingHeader } = await createMetrics({ request, params: { id } }, `[Accounts_API_GET] ${id}`);

  invariant(id, "Expected tenant.id");
  const apiKeyFromHeaders = request.headers.get("X-Api-Key") ?? "";

  try {
    if (!process.env.API_ACCESS_TOKEN || apiKeyFromHeaders !== process.env.API_ACCESS_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantSimple = await time(db.tenants.getTenantByIdOrSlug(id), "getTenant");
    if (!tenantSimple) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const tenant = await time(db.tenants.getTenant(tenantSimple.id), "getTenant");
    if (!tenant) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const subscriptions = await getActiveTenantSubscriptions(tenant.id);
    const tenantSettingsEntity = await db.entities.findEntityByName({ tenantId: null, name: "tenantSettings" });

    return NextResponse.json(
      {
        success: true,
        data: TenantHelper.apiFormat({ tenant, subscriptions, tenantSettingsEntity, t }),
      },
      { headers: getServerTimingHeader() }
    );
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error({ error: e.message });
    return NextResponse.json({ error: e.message }, { status: 400, headers: getServerTimingHeader() });
  }
}
