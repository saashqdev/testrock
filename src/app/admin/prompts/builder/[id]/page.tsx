import { PromptFlowGroup } from "@prisma/client";
import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import { OpenAIDefaults } from "@/modules/ai/utils/OpenAIDefaults";
import { PromptFlowWithDetailsDto } from "@/db/models/promptFlows/PromptFlowsModel";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { db } from "@/db";
import PromptBuilderClient from "./PromptBuilderClient";

type LoaderData = {
  item: PromptFlowWithDetailsDto;
  allEntities: EntityWithDetailsDto[];
  promptFlowGroups: PromptFlowGroup[];
};

type ActionData = {
  error?: string;
  success?: string;
};

async function handleAction(id: string, formData: FormData): Promise<ActionData> {
  "use server";

  await verifyUserHasPermission("admin.prompts.update");
  const { t } = await getServerTranslations();
  const action = formData.get("action")?.toString();

  const item = await db.promptFlows.getPromptFlow(id);
  if (!item) {
    redirect("/admin/prompts/builder");
  }

  if (action === "edit") {
    const title = formData.get("title")?.toString() ?? "";
    const description = formData.get("description")?.toString() ?? "";
    const actionTitle = formData.get("actionTitle")?.toString();
    const model = formData.get("model")?.toString() ?? OpenAIDefaults.model;
    const promptFlowGroupId = formData.get("promptFlowGroupId")?.toString() ?? null;
    const inputEntityId = formData.get("inputEntityId")?.toString() ?? null;
    const isPublic = Boolean(formData.get("isPublic"));

    if (!title || !model) {
      return { error: "Missing required fields." };
    }

    try {
      await db.promptFlows.updatePromptFlow(item.id, {
        model,
        title,
        description,
        actionTitle: actionTitle ?? null,
        promptFlowGroupId: !promptFlowGroupId?.length ? null : promptFlowGroupId,
        inputEntityId: !inputEntityId?.length ? null : inputEntityId,
        isPublic,
      });
      return { success: t("shared.saved") };
    } catch (e: any) {
      console.error(e.message);
      return { error: e.message };
    }
  } else if (action === "delete") {
    await db.promptFlows.deletePromptFlow(id);
    redirect("/admin/prompts/builder");
  } else if (action === "duplicate") {
    try {
      const created = await db.promptFlows.createPromptFlow({
        model: item.model,
        stream: item.stream,
        title: `${item.title} (copy)`,
        description: `${item.description} (copy)`,
        actionTitle: `${item.actionTitle} (copy)`,
        executionType: item.executionType,
        promptFlowGroupId: item.promptFlowGroupId ?? null,
        inputEntityId: item.inputEntityId,
        isPublic: false,
        templates: item.templates.map((template) => ({
          order: template.order,
          title: template.title,
          template: template.template,
          temperature: Number(template.temperature),
          maxTokens: template.maxTokens,
        })),
        inputVariables: item.inputVariables.map((inputVariable) => ({
          name: inputVariable.name,
          type: inputVariable.type,
          title: inputVariable.title,
          isRequired: inputVariable.isRequired,
        })),
      });
      if (item.outputs.length > 0) {
        await db.promptFlows.updatePromptFlow(created.id, {
          outputs: item.outputs.map((output) => ({
            type: output.type,
            entityId: output.entityId,
            mappings: output.mappings.map((mapping) => {
              const template = created.templates.find((t) => t.title === mapping.promptTemplate.title);
              return {
                promptTemplateId: template!.id,
                propertyId: mapping.propertyId,
              };
            }),
          })),
        });
      }
      redirect(`/admin/prompts/builder/${created.id}`);
    } catch (e: any) {
      console.error(e.message);
      return { error: e.message };
    }
  } else {
    return { error: t("shared.invalidForm") };
  }
}

export default async function PromptBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  await verifyUserHasPermission("admin.prompts.update");

  const item = await db.promptFlows.getPromptFlow(resolvedParams.id);
  if (!item) {
    redirect("/admin/prompts/builder");
  }

  const data: LoaderData = {
    item,
    allEntities: await db.entities.getAllEntities(null),
    promptFlowGroups: await db.promptFlowGroups.getAllPromptFlowGroups(),
  };

  const boundHandleAction = handleAction.bind(null, resolvedParams.id);

  return <PromptBuilderClient data={data} handleAction={boundHandleAction} />;
}
