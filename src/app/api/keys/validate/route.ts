import { getServerTranslations } from "@/i18n/server";
import { createMetrics } from "@/modules/metrics/services/server/MetricTracker";
import { ApiAccessValidation, validateTenantApiKey } from "@/utils/services/apiService";
import { db } from "@/db";
import { NextRequest } from "next/server";

// POST /api/keys/validate
export async function POST(request: NextRequest) {
  // eslint-disable-next-line no-console
  console.log("Validating API key");

  const { time, getServerTimingHeader } = await createMetrics({ request, params: {} }, `api.usage`);
  const { t } = await time(getServerTranslations(), "getTranslations");

  const startTime = performance.now();
  let apiAccessValidation: ApiAccessValidation | undefined = undefined;

  try {
    apiAccessValidation = await validateTenantApiKey(request, {});
    const { tenantApiKey } = apiAccessValidation;

    if (!tenantApiKey) {
      throw Error("Invalid API key");
    }

    await db.apiKeys.setApiKeyLogStatus(tenantApiKey?.apiKeyLog.id, {
      status: 200,
      startTime,
    });

    return Response.json(
      {
        plan: t(tenantApiKey.usage?.title ?? "", { 0: tenantApiKey.usage?.value }),
        remaining: tenantApiKey.usage?.remaining,
      },
      { headers: getServerTimingHeader() }
    );
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error({ error: e.message });

    if (apiAccessValidation?.tenantApiKey) {
      await db.apiKeys.setApiKeyLogStatus(apiAccessValidation?.tenantApiKey.apiKeyLog.id, {
        error: JSON.stringify(e),
        status: 400,
        startTime,
      });
    }

    return Response.json({ error: e.message }, { status: 400, headers: getServerTimingHeader() });
  }
}
