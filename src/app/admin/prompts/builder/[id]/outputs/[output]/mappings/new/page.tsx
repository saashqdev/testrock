import { redirect } from "next/navigation";
import PromptFlowOutputMappingForm from "@/modules/promptBuilder/components/outputs/PromptFlowOutputMappingForm";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

export const action = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const request = props.request!;
  const form = await request.formData();
  const action = form.get("action")?.toString();
  if (action === "new") {
    try {
      const promptTemplateId = form.get("promptTemplateId")?.toString() ?? "";
      const propertyId = form.get("propertyId")?.toString() ?? "";
      if (!promptTemplateId || !propertyId) {
        throw Error("Prompt template and property are required");
      }
      await db.promptFlowOutputMapping.createPromptFlowOutputMapping({
        promptFlowOutputId: params.output!,
        promptTemplateId,
        propertyId,
      });
      return redirect(`/admin/prompts/builder/${params.id}/outputs`);
    } catch (e: any) {
      return Response.json({ error: e.message }, { status: 400 });
    }
  } else {
    return Response.json({ error: "Invalid action" }, { status: 400 });
  }
};

export default async function Page(props: IServerComponentsProps) {
  const params = (await props.params) || {};
  
  const promptFlow = await db.promptFlows.getPromptFlow(params.id!);
  if (!promptFlow) {
    redirect("/admin/prompts/builder");
  }
  
  const promptFlowOutput = await db.promptFlowOutput.getPromptFlowOutput(params.output!);
  if (!promptFlowOutput) {
    redirect(`/admin/prompts/builder/${params.id}/outputs`);
  }
  
  const allEntities = await db.entities.getAllEntities(null);

  return (
    <div>
      <PromptFlowOutputMappingForm 
        item={undefined} 
        promptFlow={promptFlow} 
        promptFlowOutput={promptFlowOutput} 
        allEntities={allEntities} 
      />
    </div>
  );
}
