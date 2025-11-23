"use server";

import { KnowledgeBasesTemplateDto } from "@/modules/knowledgeBase/dtos/KnowledgeBasesTemplateDto";
import KnowledgeBaseTemplatesService from "@/modules/knowledgeBase/service/KnowledgeBaseTemplatesService.server";
import { verifyUserHasPermission } from "@/modules/permissions/services/UserPermissionsService";
import { getUserInfo } from "@/lib/services/session.server";

type ActionData = {
  previewTemplate?: KnowledgeBasesTemplateDto;
  success?: string[];
  error?: string;
};

export async function importKbsAction(prevState: ActionData | null, formData: FormData): Promise<ActionData> {
  try {
    await verifyUserHasPermission("admin.kb.view");

    const action = formData.get("action")?.toString();

    if (action === "preview") {
      await verifyUserHasPermission("admin.kb.create");
      try {
        const previewTemplate = JSON.parse(formData.get("configuration")?.toString() ?? "{}") as KnowledgeBasesTemplateDto;
        // await validateEntitiesFromTemplate(previewTemplate);
        return {
          previewTemplate,
        };
      } catch (error: any) {
        return { error: error.message };
      }
    } else if (action === "create") {
      await verifyUserHasPermission("admin.kb.create");
      try {
        const userInfo = await getUserInfo();
        const template = JSON.parse(formData.get("configuration")?.toString() ?? "{}") as KnowledgeBasesTemplateDto;
        const status = await KnowledgeBaseTemplatesService.importKbs({
          template,
          currentUserId: userInfo.userId,
        });
        const messages: string[] = [];
        messages.push(`Knowledge bases (${status.created.kbs} created, ${status.updated.kbs} updated)`);
        messages.push(`Articles (${status.created.articles} created, ${status.updated.articles} updated)`);
        messages.push(`Categories (${status.created.categories} created, ${status.updated.categories} updated)`);
        messages.push(`Category Sections (${status.created.sections} created, ${status.updated.sections} updated)`);

        return {
          success: messages,
        };
      } catch (error: any) {
        return { error: error.message };
      }
    } else {
      return { error: "Invalid form" };
    }
  } catch (error: any) {
    return { error: error.message };
  }
}
