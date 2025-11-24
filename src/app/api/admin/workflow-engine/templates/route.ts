import { action } from "@/modules/workflowEngine/routes/workflow-engine/templates/api/server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const props: IServerComponentsProps = {
    request,
    params: Promise.resolve({}),
  };

  return await action(props);
}
