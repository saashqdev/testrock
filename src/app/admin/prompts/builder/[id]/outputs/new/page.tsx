import { redirect } from "next/navigation";
import PromptFlowOutputForm from "@/modules/promptBuilder/components/outputs/PromptFlowOutputForm";
import { PromptFlowWithDetailsDto } from "@/db/models/promptFlows/PromptFlowsModel";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

type LoaderData = {
  promptFlow: PromptFlowWithDetailsDto;
  allEntities: EntityWithDetailsDto[];
};

export const action = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const request = props.request!;
  const form = await request.formData();
  const action = form.get("action")?.toString();
  if (action === "new") {
    try {
      const type = form.get("type")?.toString() ?? "";
      const entityId = form.get("entityId")?.toString() ?? "";
      if (!type || !entityId) {
        throw Error("Type and entity are required");
      }
      await db.promptFlowOutput.createPromptFlowOutput({
        promptFlowId: params.id!,
        type,
        entityId,
      });
      return redirect(`/admin/prompts/builder/${params.id}/outputs`);
    } catch (e: any) {
      return Response.json({ error: e.message }, { status: 400 });
    }
  } else {
    return Response.json({ error: "Invalid action" }, { status: 400 });
  }
};

export default async function NewPromptFlowOutput(props: IServerComponentsProps) {
  const params = (await props.params) || {};
  const promptFlow = await db.promptFlows.getPromptFlow(params.id!);
  if (!promptFlow) {
    redirect("/admin/prompts/builder");
  }
  
  const allEntities = await db.entities.getAllEntities(null);

  return (
    <div>
      <PromptFlowOutputForm item={undefined} promptFlow={promptFlow} allEntities={allEntities} />
    </div>
  );
}
