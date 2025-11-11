"use server";

import { redirect } from "next/navigation";
import FormHelper from "@/lib/helpers/FormHelper";
import { db } from "@/db";

export async function handleNewVariableAction(formData: FormData, id: string) {
  const action = formData.get("action")?.toString();
  if (action === "new") {
    const type = formData.get("type")?.toString() ?? "";
    const name = formData.get("name")?.toString() ?? "";
    const title = formData.get("title")?.toString() ?? "";
    const isRequired = FormHelper.getBoolean(formData, "isRequired") ?? false;
    if (!type || !name || !title) {
      throw Error("Type, name, and title are required");
    }
    await db.promptFlowInputVariables.createPromptFlowVariable({
      promptFlowId: id,
      type,
      name,
      title,
      isRequired,
    });
    redirect(`/admin/prompts/builder/${id}/variables`);
  } else {
    throw Error("Invalid action");
  }
}
