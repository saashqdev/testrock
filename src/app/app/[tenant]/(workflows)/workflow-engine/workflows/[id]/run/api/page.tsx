import { Metadata } from "next";
import ServerError from "@/components/ui/errors/ServerError";
import { WorkflowsIdRunApiApi } from "@/modules/workflowEngine/routes/workflow-engine/__workflow/workflows.$id.run.api.server";
import WorkflowsIdRunApiApiView from "@/modules/workflowEngine/routes/workflow-engine/__workflow/workflows.$id.run.api.view";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await WorkflowsIdRunApiApi.loader(props);
  const metatags = data?.metatags?.[0];
  return {
    title: metatags?.title || `${process.env.APP_NAME}`,
  };
}

export default async function WorkflowsIdRunApiPage(props: IServerComponentsProps) {
  try {
    const data = await WorkflowsIdRunApiApi.loader(props);
    return <WorkflowsIdRunApiApiView data={data} />;
  } catch (error) {
    return <ServerError />;
  }
}
