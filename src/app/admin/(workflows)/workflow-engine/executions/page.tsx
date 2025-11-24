import { Metadata } from "next";
import { loader, action } from "@/modules/workflowEngine/routes/workflow-engine/executions/api/server";
import WorkflowsExecutionsView from "@/modules/workflowEngine/routes/workflow-engine/executions/view";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { revalidatePath } from "next/cache";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await loader(props);
  return (data?.metatags as Metadata) || {};
}

export default async function AdminWorkflowExecutionsPage(props: IServerComponentsProps) {
  const data = await loader(props);

  // Create a server action function
  async function handleExecutionAction(formData: FormData) {
    "use server";

    try {
      // Create request with form data
      const request = new Request("http://localhost", {
        method: "POST",
        body: formData,
      });

      const actionProps: IServerComponentsProps = {
        params: props.params,
        searchParams: props.searchParams,
        request,
      };

      const result = await action(actionProps);

      // Revalidate the current path to refresh data
      revalidatePath("/admin/workflow-engine/executions");

      // If it's a Response, extract the JSON data
      if (result instanceof Response) {
        const json = await result.json();
        return json;
      }

      return result;
    } catch (error) {
      // Handle redirect errors (thrown by the action)
      if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
        throw error;
      }
      return { error: error instanceof Error ? error.message : "An error occurred" };
    }
  }

  return <WorkflowsExecutionsView data={data} action={handleExecutionAction} />;
}
