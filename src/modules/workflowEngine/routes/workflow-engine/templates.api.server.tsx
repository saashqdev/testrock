import { redirect } from "next/navigation";
import { MetaTagsDto } from "@/lib/dtos/seo/MetaTagsDto";
import { WorkflowsTemplateDto } from "@/modules/workflowEngine/dtos/WorkflowsTemplateDto";
import WorkflowEngineTemplatesService from "@/modules/workflowEngine/services/WorkflowsTemplatesService";
import UrlUtils from "@/utils/app/UrlUtils";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { getUserInfo } from "@/lib/services/session.server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

export type LoaderData = {
  metatags: MetaTagsDto;
};
export const loader = async (props: IServerComponentsProps) => {
  await requireAuth();
  const data: LoaderData = {
    metatags: [{ title: `Workflow Templates | ${process.env.APP_NAME}` }],
  };
  return data;
};
export type ActionData = {
  previewTemplate?: WorkflowsTemplateDto;
  success?: string;
  error?: string;
};
export const action = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const request = props.request!;
  await requireAuth();
  const tenantId = await getTenantIdOrNull({ request, params });
  const { userId } = await getUserInfo();
  const form = await request.formData();
  const action = form.get("action")?.toString();
  if (action === "preview") {
    try {
      const template = JSON.parse(form.get("configuration")?.toString() ?? "{}") as WorkflowsTemplateDto;
      const allWorkflows = await db.workflows.getAllWorkflows({ tenantId: tenantId?.toString() ?? null });
      await Promise.all(
        template.workflows.map(async (workflow) => {
          const existing = allWorkflows.find((w) => w.name === workflow.name);
          if (existing) {
            throw Error("Workflow already exists with name: " + workflow.name);
          }
        })
      );
      const workflows = await WorkflowEngineTemplatesService.importWorkflows(template, {
        tenantId: tenantId?.toString() ?? null,
        userId,
      });
      if (workflows.length === 0) {
        throw Error("Could not create workflow");
      }
      if (workflows.length === 1) {
        throw redirect(UrlUtils.getModulePath(params, `workflow-engine/workflows/${workflows[0].id}`));
      }
      return Response.json({
        success: `Created ${workflows.length} workflows`,
      });
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 400 });
    }
  } else if (action === "create") {
    try {
      const template = JSON.parse(form.get("configuration")?.toString() ?? "{}") as WorkflowsTemplateDto;
      const workflows = await WorkflowEngineTemplatesService.importWorkflows(template, {
        userId,
        tenantId: tenantId?.toString() ?? null,
      });
      if (workflows.length === 0) {
        throw Error("Could not create workflow");
      }
      return Response.json({
        success: workflows.map((workflow) => {
          return {
            title: `Workflow "${workflow.name}" with ${workflow.blocks.length} blocks`,
            href: UrlUtils.getModulePath(params, `workflow-engine/workflows/${workflow.id}`),
          };
        }),
      });
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 400 });
    }
  } else {
    return Response.json({ error: "Invalid form" }, { status: 400 });
  }
};

