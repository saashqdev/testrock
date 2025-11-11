import { NextRequest, NextResponse } from "next/server";
import invariant from "tiny-invariant";
import { DefaultLogActions } from "@/lib/dtos/shared/DefaultLogActions";
import { getServerTranslations } from "@/i18n/server";
import { createMetrics } from "@/modules/metrics/services/server/MetricTracker";
import { loadEntities } from "@/modules/rows/repositories/server/EntitiesSingletonService";
import EntitiesSingleton from "@/modules/rows/repositories/EntitiesSingleton";
import { RowsApi } from "@/utils/api/server/RowsApi";
import ApiHelper from "@/lib/helpers/ApiHelper";
import { ApiAccessValidation, validateApiKey } from "@/utils/services/apiService";
import { reportUsage } from "@/utils/services/server/subscriptionService";
import { db } from "@/db";

// GET - List all rows for an entity
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entity: string }> }
) {
  const resolvedParams = await params;
  const { time, getServerTimingHeader } = await createMetrics(
    { request, params: resolvedParams },
    `[Rows_API_GET_ALL] ${resolvedParams.entity}`
  );
  const { t } = await time(getServerTranslations(), "getTranslations");
  invariant(resolvedParams.entity, "Expected params.entity");
  let apiAccessValidation: ApiAccessValidation | undefined = undefined;
  const startTime = performance.now();
  
  try {
    apiAccessValidation = await time(
      validateApiKey(request, { params }),
      "validateApiKey"
    );
    await loadEntities();
    const { tenant, tenantApiKey, userId } = apiAccessValidation;
    const urlSearchParams = new URL(request.url).searchParams;
    const entity = EntitiesSingleton.getEntityByIdNameOrSlug(resolvedParams.entity!);
    const data = await time(
      RowsApi.getAll({
        entity,
        tenantId: tenant?.id ?? null,
        userId,
        urlSearchParams,
        time,
      }),
      "RowsApi.getAll"
    );
    
    if (tenant && tenantApiKey) {
      await db.apiKeys.setApiKeyLogStatus(tenantApiKey.apiKeyLog.id, {
        status: 200,
        startTime,
      });
      await time(reportUsage(tenant.id, "api"), "reportUsage");
    }

    let usage = undefined;
    if (tenantApiKey) {
      usage = {
        plan: t(tenantApiKey.usage?.title ?? "", { 0: tenantApiKey.usage?.value }),
        remaining: tenantApiKey.usage?.remaining,
      };
    }
    
    const entities = EntitiesSingleton.getInstance().getEntities();
    return NextResponse.json(
      {
        success: true,
        page: data.pagination?.page,
        total_pages: data.pagination?.totalPages,
        total_results: data.pagination?.totalItems,
        results: data.items.length,
        data: data.items.map((item) => {
          return ApiHelper.getApiFormatWithRelationships({
            entities,
            item,
          });
        }),
        usage,
      },
      { headers: getServerTimingHeader() }
    );
  } catch (e: any) {
    let status = e.message.includes("Rate limit exceeded") ? 429 : 400;
    // eslint-disable-next-line no-console
    console.error({ error: e.message });
    if (apiAccessValidation?.tenantApiKey) {
      await db.apiKeys.setApiKeyLogStatus(
        apiAccessValidation?.tenantApiKey.apiKeyLog.id,
        {
          error: JSON.stringify(e),
          status,
          startTime,
        }
      );
    }
    return NextResponse.json(
      { error: e.message },
      { status, headers: getServerTimingHeader() }
    );
  }
}

// POST - Create a new row for an entity
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ entity: string }> }
) {
  const resolvedParams = await params;
  const { time, getServerTimingHeader } = await createMetrics(
    { request, params: resolvedParams },
    `[Rows_API_POST] ${resolvedParams.entity}`
  );
  invariant(resolvedParams.entity, "Expected params.entity");
  const { t } = await time(getServerTranslations(), "getTranslations");
  let apiAccessValidation: ApiAccessValidation | undefined = undefined;
  const startTime = performance.now();
  
  try {
    apiAccessValidation = await time(
      validateApiKey(request, { params }),
      "validateApiKey"
    );
    await loadEntities();
    const { tenant, tenantApiKey, userId } = apiAccessValidation;
    const entity = EntitiesSingleton.getEntityByIdNameOrSlug(resolvedParams.entity!);
    
    const jsonBody = await time(request.json(), "request.json");
    const rowValues = ApiHelper.getRowPropertiesFromJson(t, entity, jsonBody);
    const item = await time(
      RowsApi.create({
        entity,
        tenantId: tenant?.id ?? null,
        userId,
        rowValues,
        time,
        request,
      }),
      "RowsApi.create"
    );
    
    if (tenant && tenantApiKey) {
      await db.apiKeys.setApiKeyLogStatus(tenantApiKey.apiKeyLog.id, {
        status: 201,
        startTime,
      });
      await time(reportUsage(tenant.id, "api"), "reportUsage");
    }
    
    await time(
      db.logs.createRowLog(request, {
        tenantId: tenant?.id ?? null,
        createdByApiKey: tenantApiKey?.apiKeyLog.apiKeyId,
        action: DefaultLogActions.Created,
        entity,
        item,
      }),
      "createRowLog"
    );
    
    return NextResponse.json(ApiHelper.getApiFormat(entity, item), {
      status: 201,
      headers: getServerTimingHeader(),
    });
  } catch (e: any) {
    let status = e.message.includes("Rate limit exceeded") ? 429 : 400;
    if (apiAccessValidation?.tenantApiKey) {
      await db.apiKeys.setApiKeyLogStatus(
        apiAccessValidation?.tenantApiKey.apiKeyLog.id,
        {
          error: e.message,
          status,
          startTime,
        }
      );
    }
    return NextResponse.json(
      { error: e.message },
      { status, headers: getServerTimingHeader() }
    );
  }
}
