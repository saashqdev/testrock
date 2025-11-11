"use server";

import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import { PromptGroupTemplateDto } from "@/modules/promptBuilder/dtos/PromptGroupTemplateDto";
import { db } from "@/db";

type ActionData = {
  error?: string;
  success?: string;
};

export async function createPromptGroupAction(
  prevState: ActionData | null,
  formData: FormData
): Promise<ActionData> {
  const { t } = await getServerTranslations();
  const action = formData.get("action")?.toString();

  if (action === "new") {
    const title = formData.get("title")?.toString() ?? "";
    const description = formData.get("description")?.toString() ?? "";

    const templates: PromptGroupTemplateDto[] = formData.getAll("templates[]").map((f) => {
      return JSON.parse(f.toString());
    });

    if (!title) {
      return { error: "Missing required fields." };
    }
    if (templates.length === 0) {
      return { error: "Missing templates." };
    }

    try {
      await db.promptFlowGroups.createPromptFlowGroup({
        order: 0,
        title,
        description,
        templates,
      });
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error(e.message);
      return { error: e.message };
    }

    redirect("/admin/prompts/groups");
  } else {
    return { error: t("shared.invalidForm") };
  }
}
