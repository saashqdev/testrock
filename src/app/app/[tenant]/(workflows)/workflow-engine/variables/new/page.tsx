import { Metadata } from "next";
import { loader } from "@/modules/workflowEngine/routes/workflow-engine/variables/new/api/server";
import WorkflowsVariablesNewView from "@/modules/workflowEngine/routes/workflow-engine/variables/new/view";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await loader(props);
  // Convert MetaTagsDto array to Next.js Metadata object
  const metaTags = data?.metatags || [];
  return Array.isArray(metaTags) && metaTags[0]?.title ? { title: metaTags[0].title } : {};
}

export default function WorkflowsVariablesNewPage() {
  return <WorkflowsVariablesNewView />;
}
