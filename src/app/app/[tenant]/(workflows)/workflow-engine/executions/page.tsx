import { Metadata } from "next";
import ServerError from "@/components/ui/errors/ServerError";
import { loader, action } from "@/modules/workflowEngine/routes/workflow-engine/executions/api/server";
import WorkflowsExecutionsView from "@/modules/workflowEngine/routes/workflow-engine/executions/view";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await loader(props);
  const titleMeta = data?.metatags?.find((tag: any) => tag.title);
  return {
    title: titleMeta?.title || "Workflow Executions",
    description: "View and manage workflow executions",
  };
}

export default async function ExecutionsPage(props: IServerComponentsProps) {
  try {
    const data = await loader(props);
    const actionHandler = async (formData: FormData) => {
      "use server";
      try {
        const response = await action({ ...props, request: new Request("", { method: "POST", body: formData }) });
        const result = await response.json();
        return result;
      } catch (error) {
        return { error: "An error occurred" };
      }
    };

    return <WorkflowsExecutionsView data={data} action={actionHandler} />;
  } catch (error) {
    return <ServerError />;
  }
}
