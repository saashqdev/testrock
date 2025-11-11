import { WorkflowsDangerApi } from "@/modules/workflowEngine/routes/workflow-engine/danger.api.server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest, context: { params: Promise<any> }) {
  const props: IServerComponentsProps = {
    request,
    params: context.params,
  };
  
  return await WorkflowsDangerApi.action(props);
}
