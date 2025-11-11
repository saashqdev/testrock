import { redirect } from "next/navigation";
import { Metadata } from "next";
import { MetaTagsDto } from "@/lib/dtos/seo/MetaTagsDto";
import { WorkflowDto } from "@/modules/workflowEngine/dtos/WorkflowDto";
import WorkflowsExecutionsService from "@/modules/workflowEngine/services/WorkflowsExecutionsService";
import WorkflowsService from "@/modules/workflowEngine/services/WorkflowsService";
import UrlUtils from "@/utils/app/UrlUtils";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { getUserInfo } from "@/lib/services/session.server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { getMetaTags } from "@/modules/pageBlocks/seo/SeoMetaTagsUtils";

export namespace WorkflowsIdRunStreamApi {
  export const generateMetadata = async ({ params }: { params: any }): Promise<Metadata> => {
    const tenantId = await getTenantIdOrNull({ request: {} as Request, params });
    const workflow = await WorkflowsService.get(params.id!, {
      tenantId: tenantId?.toString() ?? null,
    });
    
    return getMetaTags({
      title: workflow ? `Run Workflow (Stream): ${workflow.name} | ${process.env.APP_NAME}` : `Workflow | ${process.env.APP_NAME}`,
    });
  };

  export type LoaderData = {
    metatags: MetaTagsDto;
    workflow: WorkflowDto;
  };
  export const loader = async (props: IServerComponentsProps) => {
    const params = (await props.params) || {};
    const request = props.request!;
    const tenantId = await getTenantIdOrNull({ request, params });
    const workflow = await WorkflowsService.get(params.id!, {
      tenantId: tenantId?.toString() ?? null,
    });
    if (!workflow) {
      return redirect(UrlUtils.getModulePath(params, `workflow-engine/workflows`));
    }
    const data: LoaderData = {
      metatags: [{ title: `Run Workflow (Stream): ${workflow.name} | ${process.env.APP_NAME}` }],
      workflow,
    };
    return Response.json(data);
  };

  export type ActionData = {
    success?: string;
    error?: string;
    executionId: string;
  };
  export const action = async (props: IServerComponentsProps) => {
    const params = (await props.params) || {};
    const request = props.request!;
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
          } catch {
            throw Error("Input data is not valid JSON");
          }
        }

        const execution = await WorkflowsExecutionsService.stream(params.id!, {
          input: inputData,
          session: {
            tenantId: tenantId?.toString() ?? null,
            userId,
          },
        });
        return Response.json({ executionId: execution.id });
      } catch (e: any) {
        return Response.json({ error: e.message }, { status: 400 });
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
        return Response.json({ success: "Workflow executed" });
      } catch (e: any) {
        return Response.json({ error: e.message }, { status: 400 });
      }
    }
    return Response.json({ error: "Invalid action" }, { status: 400 });
  };
}
