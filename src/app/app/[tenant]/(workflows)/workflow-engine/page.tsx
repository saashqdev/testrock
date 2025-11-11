import { Metadata } from "next";
import ServerError from "@/components/ui/errors/ServerError";
import { WorkflowEngineIndexApi } from "@/modules/workflowEngine/routes/workflow-engine/index.api.server";
import WorkflowEngineIndexView from "@/modules/workflowEngine/routes/workflow-engine/index.view";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const data = await WorkflowEngineIndexApi.loader({} as IServerComponentsProps);
    // Convert NextJS-style metatags array to Next.js Metadata format
    const titleMeta = data?.metatags?.find((meta: any) => meta.title);
    return {
      title: titleMeta?.title || "Workflow Engine",
      description: "Manage and monitor your workflows"
    };
  } catch (error) {
    return {
      title: "Workflow Engine",
      description: "Manage and monitor your workflows"
    };
  }
}

export default async function WorkflowEngineIndexPage() {
  try {
    const data = await WorkflowEngineIndexApi.loader({} as IServerComponentsProps);
    return <WorkflowEngineIndexView data={data} />;
  } catch (error) {
    return <ServerError />;
  }
}
