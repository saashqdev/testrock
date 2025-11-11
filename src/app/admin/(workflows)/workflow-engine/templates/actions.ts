"use server";

import { WorkflowsTemplatesApi } from "@/modules/workflowEngine/routes/workflow-engine/templates.api.server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export async function workflowTemplatesAction(props: IServerComponentsProps) {
  return await WorkflowsTemplatesApi.action(props);
}
