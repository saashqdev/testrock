import { NextRequest, NextResponse } from "next/server";
import invariant from "tiny-invariant";
import { createMetrics } from "@/modules/metrics/services/server/MetricTracker";
import { db } from "@/db";

// GET - Get entity by name
export async function GET(request: NextRequest, { params }: { params: Promise<{ entity: string }> }) {
  const resolvedParams = await params;
  const { time, getServerTimingHeader } = await createMetrics({ request, params: resolvedParams }, `api.entities.${resolvedParams.entity}`);
  invariant(resolvedParams.entity, "Expected params.entity");

  try {
    const entity = await time(db.entities.getEntityByName({ tenantId: null, name: resolvedParams.entity }), "getEntityByName");

    return NextResponse.json(entity, {
      headers: getServerTimingHeader(),
    });
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error({ error: e.message });
    return NextResponse.json(
      { error: JSON.stringify(e) },
      {
        status: 400,
        headers: getServerTimingHeader(),
      }
    );
  }
}
