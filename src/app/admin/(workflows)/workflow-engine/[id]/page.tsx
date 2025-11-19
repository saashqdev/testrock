import { redirect } from "next/navigation";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export default async function WorkflowEngineIdRedirect(props: IServerComponentsProps) {
  const params = await props.params;
  if (!params) {
    redirect("/admin/workflow-engine/workflows");
  }
  const id = params.id as string;
  redirect(`/admin/workflow-engine/workflows/${id}`);
}
