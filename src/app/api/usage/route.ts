import { SubscriptionFeatureLimitType } from "@/lib/enums/subscriptions/SubscriptionFeatureLimitType";
import { getServerTranslations } from "@/i18n/server";
import { createMetrics } from "@/modules/metrics/services/server/MetricTracker";
import { ApiAccessValidation, validateTenantApiKey } from "@/utils/services/apiService";
import { db } from "@/db";
import { NextRequest } from "next/server";

// GET /api/usage
export async function GET(request: NextRequest) {
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
        remaining: tenantApiKey.usage?.type === SubscriptionFeatureLimitType.INCLUDED ? undefined : tenantApiKey.usage?.remaining,
      },
      { headers: getServerTimingHeader() }
    );
  } catch (e: any) {
    let status = e.message.includes("Rate limit exceeded") ? 429 : 400;
    // eslint-disable-next-line no-console
    console.error({ error: e.message });
    
    if (apiAccessValidation?.tenantApiKey) {
      await db.apiKeys.setApiKeyLogStatus(apiAccessValidation?.tenantApiKey.apiKeyLog.id, {
        error: JSON.stringify(e),
        status,
        startTime,
      });
    }
    
    return Response.json(
      { error: e.message }, 
      { status, headers: getServerTimingHeader() }
    );
  }
}
