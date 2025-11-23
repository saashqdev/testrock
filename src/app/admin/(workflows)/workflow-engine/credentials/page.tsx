import { Metadata } from "next";
import { loader } from "@/modules/workflowEngine/routes/workflow-engine/credentials.api.server";
import WorkflowsCredentialsView from "@/modules/workflowEngine/routes/workflow-engine/credentials.view";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { deleteCredentialAction } from "@/modules/workflowEngine/routes/workflow-engine/credentialsActions";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await loader(props);
  return (data?.metatags as Metadata) || {};
}

export default async function AdminWorkflowCredentials(props: IServerComponentsProps) {
  const data = await loader(props);

  return <WorkflowsCredentialsView data={data} deleteAction={deleteCredentialAction} />;
}
