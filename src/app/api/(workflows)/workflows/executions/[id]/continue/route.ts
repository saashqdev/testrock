import WorkflowsExecutionsService from "@/modules/workflowEngine/services/WorkflowsExecutionsService";
import { validateApiKey } from "@/utils/services/apiService";
import { NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { tenant, userId } = await validateApiKey(request, { params });
    
    let body: { [key: string]: any } = {};
    try {
      body = await request.json();
    } catch (e: any) {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    
    const execution = await WorkflowsExecutionsService.continueExecution(resolvedParams.id, {
      type: "api",
      input: body,
      session: {
        tenantId: tenant?.id ?? null,
        userId: userId ?? null,
      },
    });
    
    if (execution.error) {
      return Response.json({ error: execution.error }, { status: 400 });
    } else {
      return Response.json({ execution }, { status: 200 });
    }
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
