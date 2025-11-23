import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import { PromptGroupTemplateDto } from "@/modules/promptBuilder/dtos/PromptGroupTemplateDto";
import { db } from "@/db";
import PromptGroupEditClient from "./PromptGroupEditClient";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

// Server action for form submission
async function updatePromptGroup(formData: FormData) {
  "use server";

  const { t } = await getServerTranslations();
  const action = formData.get("action")?.toString();
  const id = formData.get("id")?.toString();

  if (!id) {
    return { error: "Missing ID" };
  }

  const item = await db.promptFlowGroups.getPromptFlowGroup(id);
  if (!item) {
    redirect("/admin/prompts/groups");
  }

  if (action === "edit") {
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
      await db.promptFlowGroups.updatePromptFlowGroup(item.id, {
        title,
        description,
        templates,
      });
    } catch (e: any) {
      console.error(e.message);
      return { error: e.message };
    }

    redirect("/admin/prompts/groups");
  } else if (action === "delete") {
    await db.promptFlowGroups.deletePromptFlowGroup(id);
    redirect("/admin/prompts/groups");
  } else {
    return { error: t("shared.invalidForm") };
  }
}

export default async function PromptGroupEditPage(props: PageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  // Fetch data server-side
  const item = await db.promptFlowGroups.getPromptFlowGroup(params.id);

  if (!item) {
    redirect("/admin/prompts/groups");
  }

  // Get error/success from searchParams if redirected with messages
  const error = searchParams?.error as string | undefined;
  const success = searchParams?.success as string | undefined;

  return <PromptGroupEditClient item={item} actionData={error || success ? { error, success } : undefined} updatePromptGroup={updatePromptGroup} />;
}
