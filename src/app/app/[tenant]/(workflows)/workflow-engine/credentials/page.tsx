import ServerError from "@/components/ui/errors/ServerError";
import { WorkflowsCredentialsApi } from "@/modules/workflowEngine/routes/workflow-engine/credentials.api.server";
import WorkflowsCredentialsView from "@/modules/workflowEngine/routes/workflow-engine/credentials.view";
import { deleteCredentialAction } from "@/modules/workflowEngine/routes/workflow-engine/credentialsActions";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export default async function AppWorkflowCredentials(props: IServerComponentsProps) {
  try {
    const data = await WorkflowsCredentialsApi.loader(props);
    return <WorkflowsCredentialsView data={data} deleteAction={deleteCredentialAction} />;
  } catch (error) {
    return <ServerError />;
  }
}
