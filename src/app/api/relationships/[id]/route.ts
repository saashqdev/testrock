import { createMetrics } from "@/modules/metrics/services/server/MetricTracker";
import { getRelationship, deleteRelationshipById } from "@/utils/api/server/RowRelationshipsApi";
import ApiHelper from "@/lib/helpers/ApiHelper";
import { ApiAccessValidation, validateApiKey } from "@/utils/services/apiService";
import { db } from "@/db";
import { NextRequest } from "next/server";

// GET /api/relationships/[id]
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { time, getServerTimingHeader } = await createMetrics({ request, params: { id } }, `[Relationships_API_GET] ${id}`);
  // const { t } = await time(getTranslations(request), "getTranslations");
  let apiAccessValidation: ApiAccessValidation | undefined = undefined;
  const startTime = performance.now();
  try {
    apiAccessValidation = await time(validateApiKey(request, { params }), "validateApiKey");
    const { tenant, userId } = apiAccessValidation;
    const relationship = await getRelationship(id, {
      tenantId: tenant?.id ?? null,
      userId,
      time,
    });
    if (!relationship) {
      throw new Error("Relationship not found");
    }
    return Response.json(
      {
        relationship: {
          id: relationship.id,
          parent: ApiHelper.getApiFormat(relationship.parent.entity, relationship.parent.item),
          child: ApiHelper.getApiFormat(relationship.child.entity, relationship.child.item),
        },
      },
      { status: 200, headers: getServerTimingHeader() }
    );
  } catch (e: any) {
    if (apiAccessValidation?.tenantApiKey) {
      await db.apiKeys.setApiKeyLogStatus(apiAccessValidation?.tenantApiKey.apiKeyLog.id, {
        error: e.message,
        status: 400,
        startTime,
      });
    }
    return Response.json({ error: e.message }, { status: 400, headers: getServerTimingHeader() });
  }
}

// DELETE /api/relationships/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { time, getServerTimingHeader } = await createMetrics({ request, params: { id } }, `[Relationships_API_DELETE] ${id}`);
  // const { t } = await time(getTranslations(request), "getTranslations");
  let apiAccessValidation: ApiAccessValidation | undefined = undefined;
  const startTime = performance.now();
  try {
    apiAccessValidation = await time(validateApiKey(request, { params }), "validateApiKey");
    const { tenant, userId } = apiAccessValidation;

    const relationship = await getRelationship(id, {
      tenantId: tenant?.id ?? null,
      userId,
      time,
    });
    if (!relationship) {
      throw new Error("Relationship not found");
    }
    const item = await time(
      deleteRelationshipById(id, {
        tenantId: tenant?.id ?? null,
        userId,
        time,
      }),
      "deleteRelationshipById"
    );
    return Response.json({ deleted: item }, { status: 200, headers: getServerTimingHeader() });
  } catch (e: any) {
    if (apiAccessValidation?.tenantApiKey) {
      await db.apiKeys.setApiKeyLogStatus(apiAccessValidation?.tenantApiKey.apiKeyLog.id, {
        error: e.message,
        status: 400,
        startTime,
      });
    }
    return Response.json({ error: e.message }, { status: 400, headers: getServerTimingHeader() });
  }
}
