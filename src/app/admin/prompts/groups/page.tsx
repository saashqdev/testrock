import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import { PromptFlowGroupWithDetailsDto } from "@/db/models/promptFlows/PromptFlowGroupsModel";
import { OpenAIDefaults } from "@/modules/ai/utils/OpenAIDefaults";
import { db } from "@/db";
import { GroupsClient } from "./GroupsClient";
import type { Metadata } from "next";

type LoaderData = {
  title: string;
  items: PromptFlowGroupWithDetailsDto[];
};

// Server Action for form submissions
async function addPromptFlowAction(formData: FormData) {
  "use server";
  
  const { t } = await getServerTranslations();
  const action = formData.get("action")?.toString();

  if (action === "add-prompt-flow") {
    const id = formData.get("id")?.toString() ?? "";

    const promptFlowGroup = await db.promptFlowGroups.getPromptFlowGroup(id);
    if (!promptFlowGroup) {
      throw new Error(t("shared.notFound"));
    }

    const promptFlow = await db.promptFlows.createPromptFlow({
      model: OpenAIDefaults.model,
      stream: false,
      title: `${promptFlowGroup.title}: Untitled #${promptFlowGroup.promptFlows.length + 1}`,
      description: "",
      actionTitle: "",
      executionType: "sequential",
      promptFlowGroupId: promptFlowGroup.id,
      inputEntityId: null,
      isPublic: true,
      templates: promptFlowGroup.templates.map((t) => ({
        order: t.order,
        title: t.title,
        template: "",
        temperature: OpenAIDefaults.temperature,
        maxTokens: 0,
      })),
    });

    redirect(`/admin/prompts/builder/${promptFlow.id}`);
  } else {
    throw new Error(t("shared.invalidForm"));
  }
}

// Generate metadata
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("prompts.builder.title")} | Groups | ${process.env.APP_NAME}`,
  };
}

// Server Component
export default async function GroupsPage({ children }: { children?: React.ReactNode }) {
  const items = await db.promptFlowGroups.getAllPromptFlowGroups();

  return <GroupsClient items={items} addPromptFlowAction={addPromptFlowAction}>{children}</GroupsClient>;
}
