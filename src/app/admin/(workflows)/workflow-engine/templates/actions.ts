"use server";

import { action } from "@/modules/workflowEngine/routes/workflow-engine/templates.api.server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export async function workflowTemplatesAction(props: IServerComponentsProps) {
  return await action(props);
}
