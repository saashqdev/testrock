import { Metadata } from "next";
import { WorkflowsCredentialsApi } from "@/modules/workflowEngine/routes/workflow-engine/credentials.api.server";
import WorkflowsCredentialsView from "@/modules/workflowEngine/routes/workflow-engine/credentials.view";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { deleteCredentialAction } from "@/modules/workflowEngine/routes/workflow-engine/credentialsActions";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await WorkflowsCredentialsApi.loader(props);
  return (data?.metatags as Metadata) || {};
}

export default async function AdminWorkflowCredentials(props: IServerComponentsProps) {
  const data = await WorkflowsCredentialsApi.loader(props);
  
  return <WorkflowsCredentialsView data={data} deleteAction={deleteCredentialAction} />;
}
