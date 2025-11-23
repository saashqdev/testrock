"use server";

import { redirect } from "next/navigation";
import { db } from "@/db";
import FormHelper from "@/lib/helpers/FormHelper";

export async function deleteVariableAction(id: string) {
  try {
    await db.promptFlowInputVariables.deletePromptFlowVariable(id);
    return { success: "Variable deleted successfully" };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function handleVariableAction(form: FormData, variableId: string, promptId: string) {
  const action = form.get("action")?.toString();

  const item = await db.promptFlowInputVariables.getPromptFlowVariable(variableId);
  if (!item) {
    redirect(`/admin/prompts/builder/${promptId}/variables`);
  }

  if (action === "edit") {
    try {
      const type = form.get("type")?.toString() ?? "";
      const name = form.get("name")?.toString() ?? "";
      const title = form.get("title")?.toString() ?? "";
      const isRequired = FormHelper.getBoolean(form, "isRequired") ?? false;

      if (!type || !name || !title) {
        throw Error("Type, name, and title are required");
      }

      await db.promptFlowInputVariables.updatePromptFlowVariable(item.id, {
        type,
        name,
        title,
        isRequired,
      });

      redirect(`/admin/prompts/builder/${promptId}/variables`);
    } catch (e: any) {
      return { error: e.message };
    }
  } else if (action === "delete") {
    try {
      await db.promptFlowInputVariables.deletePromptFlowVariable(item.id);
      redirect(`/admin/prompts/builder/${promptId}/variables`);
    } catch (e: any) {
      return { error: e.message };
    }
  } else {
    return { error: "Invalid action" };
  }
}
