import { redirect } from "next/navigation";
import { MetaTagsDto } from "@/lib/dtos/seo/MetaTagsDto";
import { WorkflowDto } from "@/modules/workflowEngine/dtos/WorkflowDto";
import { WorkflowExecutionDto } from "@/modules/workflowEngine/dtos/WorkflowExecutionDto";
import WorkflowsService from "@/modules/workflowEngine/services/WorkflowsService";
import UrlUtils from "@/utils/app/UrlUtils";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export type LoaderData = {
  metatags: MetaTagsDto;
  item: WorkflowDto;
  executions: WorkflowExecutionDto[];
};
export const loader = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const request = props.request!;
  await requireAuth();
  const tenantId = await getTenantIdOrNull({ request, params });
  const item = await WorkflowsService.get(params?.id!, { tenantId: tenantId?.toString() ?? null });
  if (!item) {
    throw redirect(UrlUtils.getModulePath(params || {}, `workflow-engine/workflows`));
  }
  const executions = await WorkflowsService.getExecutions(item, { tenantId: tenantId?.toString() ?? null });
  const data: LoaderData = {
    metatags: [{ title: `Workflow Executions: ${item.name} | ${process.env.APP_NAME}` }],
    item,
    executions,
  };
  return data;
};
