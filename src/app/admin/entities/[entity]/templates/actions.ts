"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getServerTranslations } from "@/i18n/server";
import UrlUtils from "@/utils/app/UrlUtils";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { db } from "@/db";

type CreateTemplateResult = {
  success?: boolean;
  error?: string;
};

export async function createEntityTemplate(
  entitySlug: string,
  formData: FormData
): Promise<CreateTemplateResult> {
  try {
    const { t } = await getServerTranslations();
    const headersList = await headers();
    
    const request = {
      headers: headersList,
    } as Request;

    // Get params from the form or construct them
    const params = { entity: entitySlug };
    const tenantId = await getTenantIdOrNull({ request, params });

    const entity = await db.entities.getEntityBySlug({ 
      tenantId, 
      slug: entitySlug 
    });

    const action = formData.get("action")?.toString() ?? "";
    const title = formData.get("title")?.toString() ?? "";
    const config = formData.get("config")?.toString() ?? "";

    if (action === "create") {
      await db.entityTemplates.createEntityTemplate({
        entityId: entity.id,
        tenantId,
        title,
        config,
      });
      
      // Redirect after successful creation
      redirect(UrlUtils.getModulePath(params, `entities/${entitySlug}/templates`));
    }

    return { error: t("shared.invalidForm") };
  } catch (e: any) {
    // Handle redirect thrown by Next.js
    if (e.message?.includes("NEXT_REDIRECT")) {
      throw e;
    }
    return { error: e.message };
  }
}
