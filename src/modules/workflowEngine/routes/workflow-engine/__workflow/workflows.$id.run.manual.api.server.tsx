import { redirect } from "next/navigation";
import { MetaTagsDto } from "@/lib/dtos/seo/MetaTagsDto";
import { WorkflowDto } from "@/modules/workflowEngine/dtos/WorkflowDto";
import { WorkflowExecutionDto } from "@/modules/workflowEngine/dtos/WorkflowExecutionDto";
import WorkflowsExecutionsService from "@/modules/workflowEngine/services/WorkflowsExecutionsService";
import WorkflowsService from "@/modules/workflowEngine/services/WorkflowsService";
import UrlUtils from "@/utils/app/UrlUtils";
import { requireAuth } from "@/lib/services//loaders.middleware";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { getUserInfo } from "@/lib/services/session.server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export type LoaderData = {
  metatags: MetaTagsDto;
  workflow: WorkflowDto;
};
export const loader = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const request = props.request!;
  await requireAuth();
  const tenantId = await getTenantIdOrNull({ request, params });
  const workflow = await WorkflowsService.get(params.id!, {
    tenantId: tenantId?.toString() ?? null,
  });
  if (!workflow) {
    throw redirect(UrlUtils.getModulePath(params, `workflow-engine/workflows`));
  }
  const data: LoaderData = {
    metatags: [{ title: `Run Workflow (Manual): ${workflow.name} | ${process.env.APP_NAME}` }],
    workflow,
  };
  return data;
};

export type ActionData = {
  success?: string;
  error?: string;
  execution?: WorkflowExecutionDto;
};
export const action = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const request = props.request!;
  await requireAuth();
  const tenantId = await getTenantIdOrNull({ request, params });
  const { userId } = await getUserInfo();
  const form = await request.formData();
  const action = form.get("action")?.toString();
  if (action === "execute") {
    try {
      let input = form.get("input")?.toString() ?? "{}";
      let inputData: { [key: string]: any } | null = null;
      if (!input.trim()) {
        input = "{}";
      }
      if (input) {
        try {
          inputData = JSON.parse(input);
        } catch (parseError: any) {
          return Response.json(
            { error: "Input data is not valid JSON: " + (parseError?.message || "Invalid JSON format") },
            { status: 400 }
          );
        }
      }
      const execution = await WorkflowsExecutionsService.execute(params.id!, {
        type: "manual",
        input: inputData,
        session: {
          tenantId: tenantId?.toString() ?? null,
          userId,
        },
      });
      if (execution.status === "error") {
        return Response.json(
          {
            error: "Workflow execution failed: " + execution.error,
            execution,
          },
          { status: 400 }
        );
      }
      return Response.json({ success: "Workflow executed", execution });
    } catch (e: any) {
      return Response.json({ error: e?.message || e?.toString() || "An error occurred during workflow execution" }, { status: 400 });
    }
  } else if (action === "continue-execution") {
    try {
      const executionId = form.get("executionId")?.toString() ?? "";
      const execution = await WorkflowsExecutionsService.continueExecution(executionId, {
        type: "manual",
        input: { input: form.get("input")?.toString() },
        session: { tenantId: tenantId?.toString() ?? null, userId },
      });
      if (execution.status === "error") {
        return Response.json({ error: "Workflow execution failed: " + execution.error }, { status: 400 });
      }
      return Response.json({ success: "Workflow executed", execution });
    } catch (e: any) {
      return Response.json({ error: e?.message || e?.toString() || "An error occurred during workflow execution" }, { status: 400 });
    }
  }
  return Response.json({ error: "Invalid action" }, { status: 400 });
};
