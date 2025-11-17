"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { requireAuth } from "@/lib/services/loaders.middleware";

type ActionState = {
  success?: string;
  error?: string;
} | null;

export async function deleteCredentialAction(prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireAuth();
    const id = formData.get("id")?.toString() ?? "";
    const tenantId = formData.get("tenantId")?.toString() ?? null;
    
    await db.workflowCredentials.deleteWorkflowCredential(id, { tenantId });
    
    revalidatePath("/admin/__workflows/workflow-engine/credentials");
    return { success: "Credential deleted successfully" };
  } catch (error) {
    console.error("Error deleting credential:", error);
    return { error: "Failed to delete credential" };
  }
}