import { Metadata } from "next";
import ServerError from "@/components/ui/errors/ServerError";
import { loader } from "@/modules/workflowEngine/routes/workflow-engine/__workflow/workflows.$id.executions.api.server";
import WorkflowsIdExecutionsView from "@/modules/workflowEngine/routes/workflow-engine/__workflow/workflows.$id.executions.view";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import "reactflow/dist/style.css";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await loader(props);
  const metatags = data?.metatags || [];
  
  // Convert NextJS meta tags to Next.js Metadata
  const metadata: Metadata = {};
  metatags.forEach((tag: any) => {
    if (tag.title) {
      metadata.title = tag.title;
    }
  });
  
  return metadata;
}

export default function WorkflowsIdExecutionsPage() {
  return <WorkflowsIdExecutionsView />;
}
