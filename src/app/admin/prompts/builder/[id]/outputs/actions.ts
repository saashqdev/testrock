"use server";

import { db } from "@/db";
import { revalidatePath } from "next/cache";

export async function updatePromptFlowOutputAction(outputId: string, promptFlowId: string, data: { type: string; entityId: string }) {
  try {
    const item = await db.promptFlowOutput.getPromptFlowOutput(outputId);
    if (!item) {
      return { success: false, error: "Output not found" };
    }

    const { type, entityId } = data;
    if (!type || !entityId) {
      return { success: false, error: "Type and entity are required" };
    }

    await db.promptFlowOutput.updatePromptFlowOutput(item.id, {
      type,
      entityId,
    });

    revalidatePath(`/admin/prompts/builder/${promptFlowId}/outputs`);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deletePromptFlowOutputAction(outputId: string, promptFlowId: string) {
  try {
    const item = await db.promptFlowOutput.getPromptFlowOutput(outputId);
    if (!item) {
      return { success: false, error: "Output not found" };
    }

    await db.promptFlowOutput.deletePromptFlowOutput(item.id);

    revalidatePath(`/admin/prompts/builder/${promptFlowId}/outputs`);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
