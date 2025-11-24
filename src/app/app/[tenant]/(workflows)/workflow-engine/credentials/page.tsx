import ServerError from "@/components/ui/errors/ServerError";
import { loader } from "@/modules/workflowEngine/routes/workflow-engine/credentials/api/server";
import WorkflowsCredentialsView from "@/modules/workflowEngine/routes/workflow-engine/credentials/view";
import { deleteCredentialAction } from "@/modules/workflowEngine/routes/workflow-engine/credentials/actions";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export default async function AppWorkflowCredentials(props: IServerComponentsProps) {
  try {
    const data = await loader(props);
    return <WorkflowsCredentialsView data={data} deleteAction={deleteCredentialAction} />;
  } catch (error) {
    return <ServerError />;
  }
}
