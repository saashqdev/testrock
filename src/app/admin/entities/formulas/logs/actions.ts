"use server";

import { prisma } from "@/db/config/prisma/database";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { getServerTranslations } from "@/i18n/server";
import { revalidatePath } from "next/cache";

export async function deleteFormulaLogs(ids: string[]) {
  // Note: You'll need to get the request object for verification
  // This might need adjustment based on your auth implementation
  const { t } = await getServerTranslations();

  try {
    // Add permission verification here if needed
    // await verifyUserHasPermission("admin.formulas.delete");

    await prisma.formulaLog.deleteMany({
      where: { id: { in: ids } },
    });

    revalidatePath("/admin/entities/formulas/logs");

    return { success: true };
  } catch (error) {
    console.error("Error deleting formula logs:", error);
    throw new Error(t("shared.invalidForm"));
  }
}
