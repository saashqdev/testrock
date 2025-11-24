import { redirect } from "next/navigation";
import { WorkflowsTemplateDto } from "@/modules/workflowEngine/dtos/WorkflowsTemplateDto";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import WorkflowEngineTemplatesService from "@/modules/workflowEngine/services/WorkflowsTemplatesService";
import WorkflowsService from "@/modules/workflowEngine/services/WorkflowsService";
import { WorkflowDto } from "@/modules/workflowEngine/dtos/WorkflowDto";
import UrlUtils from "@/utils/app/UrlUtils";
import { MetaTagsDto } from "@/lib/dtos/seo/MetaTagsDto";
import { getUserInfo } from "@/lib/services/session.server";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

export type LoaderData = {
  metatags: MetaTagsDto;
  items: WorkflowDto[];
  template: WorkflowsTemplateDto;
  children?: React.ReactNode;
};
export const loader = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const request = props.request!;
  await requireAuth();
  const tenantId = await getTenantIdOrNull({ request, params });
  const items = await WorkflowsService.getAll({ tenantId: tenantId?.toString() ?? null });
  const variables = await db.workflowVariable.getAllWorkflowVariables({ tenantId: tenantId?.toString() ?? null });
  const data: LoaderData = {
    metatags: [{ title: `Workflows | ${process.env.APP_NAME}` }],
    items,
    template: await WorkflowEngineTemplatesService.getTemplate(items, variables),
  };
  return data;
};

export type ActionData = {
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
  if (action === "toggle-status") {
    const id = form.get("id")?.toString() ?? "";

    const item = await db.workflows.getWorkflowById({ id, tenantId: tenantId?.toString() ?? null });
    if (!item) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    if (item.status === "draft") {
      await WorkflowsService.update(item.id, { status: "live" }, { tenantId: tenantId?.toString() ?? null });
      return Response.json({ success: "Workflow is now live" });
    } else {
      await WorkflowsService.update(
        item.id,
        {
          status: "draft",
        },
        { tenantId: tenantId?.toString() ?? null }
      );
      return Response.json({ success: "Workflow is now draft" });
    }
  } else if (action === "create") {
    const { id } = await WorkflowsService.create({ tenantId: tenantId?.toString() ?? null, userId });
    throw redirect(UrlUtils.getModulePath(params, `workflow-engine/workflows/${id}`));
  } else if (action === "delete") {
    const id = form.get("id")?.toString() ?? "";
    await WorkflowsService.del(id, { tenantId: tenantId?.toString() ?? null });
    throw redirect(UrlUtils.getModulePath(params, `workflow-engine/workflows`));
  } else {
    return Response.json({ error: "Invalid form" }, { status: 400 });
  }
};
