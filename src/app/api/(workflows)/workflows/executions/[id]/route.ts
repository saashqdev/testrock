import WorkflowsService from "@/modules/workflowEngine/services/WorkflowsService";
import { validateApiKey } from "@/utils/services/apiService";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { tenant } = await validateApiKey(request, { params });

    const execution = await WorkflowsService.getExecution(resolvedParams.id, {
      tenantId: tenant?.id ?? null,
    });

    if (!execution) {
      return Response.json({ error: "Execution not found" }, { status: 404 });
    }

    return Response.json({ execution }, { status: 200 });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 400 });
  }
}
