import { createMetrics } from "@/modules/metrics/services/server/MetricTracker";
import { createRelationship } from "@/utils/api/server/RowRelationshipsApi";
import { ApiAccessValidation, validateApiKey } from "@/utils/services/apiService";
import { db } from "@/db";
import { NextRequest } from "next/server";

// POST /api/relationships
export async function POST(request: NextRequest) {
  const { time, getServerTimingHeader } = await createMetrics({ request, params: {} }, `[Relationships_API_POST]`);
  // const { t } = await time(getTranslations(request), "getTranslations");
  let apiAccessValidation: ApiAccessValidation | undefined = undefined;
  const startTime = performance.now();
  try {
    apiAccessValidation = await time(validateApiKey(request, {}), "validateApiKey");

    const jsonBody = await time(request.json(), "request.json");
    const { parent, child } = jsonBody;
    if (!parent) {
      throw new Error("Parent and child are required");
    }
    const parentRow = await db.rows.getRowById(parent);
    const childRow = await db.rows.getRowById(child);
    if (!parentRow) {
      throw new Error("Parent row not found: " + parent);
    } else if (!childRow) {
      throw new Error("Child row not found: " + child);
    }
    const item = await time(
      createRelationship({
        parent: parentRow,
        child: childRow,
        time,
      }),
      "RowsApi.createRelationship"
    );
    return Response.json(
      { relationship: item },
      {
        status: 201,
        headers: getServerTimingHeader(),
      }
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
