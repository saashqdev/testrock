import { Metadata } from "next";
import { loader } from "@/modules/workflowEngine/routes/workflow-engine/credentials/credentials.new.api.server";
import WorkflowsCredentialsNewView from "@/modules/workflowEngine/routes/workflow-engine/credentials/credentials.new.view";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await loader(props);
  const metatags = data?.metatags || [];

  // Convert NextJS meta array to Next.js Metadata object
  const metadata: Metadata = {};
  metatags.forEach((tag: any) => {
    if (tag.title) {
      metadata.title = tag.title;
    }
  });

  return metadata;
}

export default function WorkflowsCredentialsNewPage() {
  return <WorkflowsCredentialsNewView />;
}
