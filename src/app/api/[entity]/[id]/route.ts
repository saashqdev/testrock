import { NextRequest, NextResponse } from "next/server";
import invariant from "tiny-invariant";
import { DefaultLogActions } from "@/lib/dtos/shared/DefaultLogActions";
import { getServerTranslations } from "@/i18n/server";
import { createMetrics } from "@/modules/metrics/services/server/MetricTracker";
import { loadEntities } from "@/modules/rows/repositories/server/EntitiesSingletonService";
import EntitiesSingleton from "@/modules/rows/repositories/EntitiesSingleton";
import { get, update, del } from "@/utils/api/server/RowsApi";
import ApiHelper from "@/lib/helpers/ApiHelper";
import EventsService from "@/modules/events/services/server/EventsService";
import { ApiAccessValidation, validateApiKey } from "@/utils/services/apiService";
import { reportUsage } from "@/utils/services/server/subscriptionService";
import { RowDeletedDto } from "@/modules/events/dtos/RowDeletedDto";
import RowHelper from "@/lib/helpers/RowHelper";
import { RowUpdatedDto } from "@/modules/events/dtos/RowUpdatedDto";
import { db } from "@/db";

// GET - Get a single row by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ entity: string; id: string }> }) {
  const resolvedParams = await params;
  const { time, getServerTimingHeader } = await createMetrics({ request, params: resolvedParams }, `[Rows_API_GET] ${resolvedParams.entity}`);
  const { t } = await time(getServerTranslations(), "getTranslations");
  invariant(resolvedParams.entity, "Expected params.entity");
  let apiAccessValidation: ApiAccessValidation | undefined = undefined;
  const startTime = performance.now();

  try {
    apiAccessValidation = await time(validateApiKey(request, { params }), "validateApiKey");
    await loadEntities();
    const { tenant, tenantApiKey, userId } = apiAccessValidation;

    const entity = EntitiesSingleton.getEntityByIdNameOrSlug(resolvedParams.entity!);
    const data = await time(
      get(resolvedParams.id!, {
        entity,
        tenantId: tenant?.id ?? null,
        userId,
        time,
      }),
      "get"
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
        data: ApiHelper.getApiFormatWithRelationships({
          entities,
          item: data.item,
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
      await db.apiKeys.setApiKeyLogStatus(apiAccessValidation.tenantApiKey.apiKeyLog.id, {
        error: JSON.stringify(e),
        status,
        startTime,
      });
    }
    return NextResponse.json({ error: e.message }, { status, headers: getServerTimingHeader() });
  }
}

// PUT - Update a row by ID
export async function PUT(request: NextRequest, { params }: { params: Promise<{ entity: string; id: string }> }) {
  const resolvedParams = await params;
  const { time, getServerTimingHeader } = await createMetrics({ request, params: resolvedParams }, `[Rows_API_PUT] ${resolvedParams.entity}`);
  invariant(resolvedParams.entity, "Expected params.entity");
  const { t } = await time(getServerTranslations(), "getTranslations");
  let apiAccessValidation: ApiAccessValidation | undefined = undefined;
  const startTime = performance.now();

  try {
    apiAccessValidation = await time(validateApiKey(request, { params }), "validateApiKey");
    await loadEntities();
    const { tenant, tenantApiKey, userId } = apiAccessValidation;
    const entity = EntitiesSingleton.getEntityByIdNameOrSlug(resolvedParams.entity!);
    const tenantId = tenant?.id ?? null;

    const data = await time(
      get(resolvedParams.id!, {
        entity,
        tenantId,
        userId,
        time,
      }),
      "get"
    );

    if (!data.item) {
      throw Error(t("shared.notFound"));
    }

    const existing = data.item;
    const jsonBody = await time(request.json(), "request.json");
    const rowValues = ApiHelper.getRowPropertiesFromJson(t, entity, jsonBody, existing);

    const updated = await time(
      update(resolvedParams.id!, {
        entity,
        tenantId: tenant?.id ?? null,
        userId,
        rowValues,
      }),
      "update"
    );

    await EventsService.create({
      request,
      event: "row.updated",
      tenantId: tenant?.id ?? null,
      userId: null,
      data: {
        id: existing.id,
        title: RowHelper.getTextDescription({ entity, item: existing, t }),
        entity: { id: entity.id, name: entity.name, slug: entity.slug, title: t(entity.title) },
        row: RowHelper.getDiff({ entity, before: existing, after: updated }),
        apiKey: {
          id: tenantApiKey?.apiKey.id ?? "",
          alias: tenantApiKey?.apiKey.alias ?? "",
        },
      } satisfies RowUpdatedDto,
    });

    if (tenant && tenantApiKey) {
      await db.apiKeys.setApiKeyLogStatus(tenantApiKey.apiKeyLog.id, {
        status: 200,
        startTime,
      });
      await time(reportUsage(tenant.id, "api"), "reportUsage");
    }

    await time(
      db.logs.createRowLog(request, {
        tenantId: tenant?.id ?? null,
        createdByApiKey: tenantApiKey?.apiKeyLog.apiKeyId,
        action: DefaultLogActions.Updated,
        entity,
        details: JSON.stringify(jsonBody),
        item: existing,
      }),
      "createRowLog"
    );

    const updatedData = await time(
      get(resolvedParams.id!, {
        entity,
        time,
      }),
      "get"
    );

    return NextResponse.json(ApiHelper.getApiFormat(entity, updatedData.item), {
      status: 200,
      headers: getServerTimingHeader(),
    });
  } catch (e: any) {
    let status = e.message.includes("Rate limit exceeded") ? 429 : 400;
    if (apiAccessValidation?.tenantApiKey) {
      await db.apiKeys.setApiKeyLogStatus(apiAccessValidation?.tenantApiKey.apiKeyLog.id, {
        error: e.message,
        status,
        startTime,
      });
    }
    return NextResponse.json({ error: e.message }, { status, headers: getServerTimingHeader() });
  }
}

// DELETE - Delete a row by ID
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ entity: string; id: string }> }) {
  const resolvedParams = await params;
  const { time, getServerTimingHeader } = await createMetrics({ request, params: resolvedParams }, `[Rows_API_DELETE] ${resolvedParams.entity}`);
  invariant(resolvedParams.entity, "Expected params.entity");
  const { t } = await time(getServerTranslations(), "getTranslations");
  let apiAccessValidation: ApiAccessValidation | undefined = undefined;
  const startTime = performance.now();

  try {
    apiAccessValidation = await time(validateApiKey(request, { params }), "validateApiKey");
    await loadEntities();
    const { tenant, tenantApiKey, userId } = apiAccessValidation;
    const entity = EntitiesSingleton.getEntityByIdNameOrSlug(resolvedParams.entity!);
    const tenantId = tenant?.id ?? null;

    const data = await time(
      get(resolvedParams.id!, {
        entity,
        tenantId,
        userId,
        time,
      }),
      "get"
    );

    if (!data.item) {
      throw Error(t("shared.notFound"));
    }

    const existing = data.item;

    await time(
      del(resolvedParams.id!, {
        entity,
        tenantId,
        userId,
        time,
      }),
      "del"
    );

    await EventsService.create({
      request,
      event: "row.deleted",
      tenantId: tenant?.id ?? null,
      userId: null,
      data: {
        id: existing.id,
        title: RowHelper.getTextDescription({ entity, item: existing, t }),
        row: ApiHelper.getApiFormat(entity, existing),
        entity: { id: entity.id, name: entity.name, slug: entity.slug, title: t(entity.title) },
        apiKey: {
          id: tenantApiKey?.apiKey.id ?? "",
          alias: tenantApiKey?.apiKey.alias ?? "",
        },
      } satisfies RowDeletedDto,
    });

    if (tenant && tenantApiKey) {
      await db.apiKeys.setApiKeyLogStatus(tenantApiKey.apiKeyLog.id, {
        status: 204,
        startTime,
      });
      await time(reportUsage(tenant.id, "api"), "reportUsage");
    }

    await time(
      db.logs.createRowLog(request, {
        tenantId: tenant?.id ?? null,
        createdByApiKey: tenantApiKey?.apiKeyLog.apiKeyId,
        action: DefaultLogActions.Deleted,
        entity,
        details: "{}",
        item: null,
      }),
      "createRowLog"
    );

    return NextResponse.json({ success: true }, { status: 204, headers: getServerTimingHeader() });
  } catch (e: any) {
    let status = e.message.includes("Rate limit exceeded") ? 429 : 400;
    if (apiAccessValidation?.tenantApiKey) {
      await db.apiKeys.setApiKeyLogStatus(apiAccessValidation?.tenantApiKey.apiKeyLog.id, {
        error: e.message,
        status,
        startTime,
      });
    }
    return NextResponse.json({ error: e.message }, { status, headers: getServerTimingHeader() });
  }
}
