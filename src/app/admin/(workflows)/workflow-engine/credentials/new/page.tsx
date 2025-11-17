import { Metadata } from "next";
import { loader } from "@/modules/workflowEngine/routes/workflow-engine/credentials/credentials.new.api.server";
import WorkflowsCredentialsNewView from "@/modules/workflowEngine/routes/workflow-engine/credentials/credentials.new.view";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await loader(props);
  return (data?.metatags as Metadata) || {};
}

export default async function WorkflowsCredentialsNewPage(props: IServerComponentsProps) {
  // Load data server-side
  const data = await loader(props);
  
  return <WorkflowsCredentialsNewView />;
}
