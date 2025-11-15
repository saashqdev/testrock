"use server";

import { prisma } from "@/db/config/prisma/database";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { getServerTranslations } from "@/i18n/server";
import { revalidatePath } from "next/cache";

export const actionAdminKnowledgeBaseDanger = async (prev: any, form: FormData) => {
  const { t } = await getServerTranslations();
  const action = form.get("action");
  if (action === "reset-all-data") {
    await verifyUserHasPermission("admin.kb.delete");
    await prisma.knowledgeBaseCategory.deleteMany({});
    await prisma.knowledgeBaseArticle.deleteMany({});
    await prisma.knowledgeBase.deleteMany({});
    revalidatePath("/admin/knowledge-base/danger");
    return { success: "Reset successful" };
  } else {
    return { error: t("shared.invalidForm") };
  }
};
