import { Metadata } from "next";
import ServerError from "@/components/ui/errors/ServerError";
import { loader } from "@/modules/workflowEngine/routes/workflow-engine/__workflow/workflows.$id.index.api.server";
import WorkflowsIdIndexView from "@/modules/workflowEngine/routes/workflow-engine/__workflow/workflows.$id.index.view";
import "reactflow/dist/style.css";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const data = await loader({ params });
  // Convert MetaTagsDto array to Next.js Metadata
  const metatags = data?.metatags || [];
  const metadata: Metadata = {};
  
  metatags.forEach((tag) => {
    if ('title' in tag) {
      metadata.title = tag.title;
    } else if ('name' in tag && tag.name === 'description') {
      metadata.description = tag.content;
    }
  });
  
  return metadata;
}
export default function WorkflowPage({ params }: { params: Promise<{ id: string }> }) {
  return <WorkflowsIdIndexView params={params} />;
}

export function ErrorBoundary() {
  return <ServerError />;
}
