"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getServerTranslations } from "@/i18n/server";
import UrlUtils from "@/utils/app/UrlUtils";
import { getApiKeyEntityPermissions } from "@/lib/helpers/server/ApiKeyHelperService";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import EventsService from "@/modules/events/services/server/EventsService";
import { getTenantIdFromUrl } from "@/utils/services/server/urlService";
import { getUserInfo } from "@/lib/services/session.server";
import { ApiKeyCreatedDto } from "@/modules/events/dtos/ApiKeyCreatedDto";
import { db } from "@/db";

type ActionData = {
  error?: string;
  apiKey?: {
    key: string;
    alias: string;
  };
};

export async function createApiKey(params: any, formData: FormData): Promise<ActionData> {
  try {
    const { t } = await getServerTranslations();
    const tenantSlug = params.tenant || params;
    const tenantId = await getTenantIdFromUrl(tenantSlug);
    
    // Create a mock Request object for permission verification
    const headersList = await headers();
    const host = headersList.get("host") || "";
    const protocol = headersList.get("x-forwarded-proto") || "http";
    const url = `${protocol}://${host}/app/${params.tenant}/settings/api/keys/new`;
    const request = new Request(url);
    
    await verifyUserHasPermission("app.settings.apiKeys.create", tenantId);
    
    const userInfo = await getUserInfo();
    const currentUser = await db.users.getUser(userInfo.userId);

    if (!currentUser) {
      console.error("User not found:", userInfo.userId);
      return { error: "User not found" };
    }

    const action = formData.get("action")?.toString() ?? "";
    if (action === "create") {
      const entities: { entityId: string; create: boolean; read: boolean; update: boolean; delete: boolean }[] = formData
        .getAll("entities[]")
        .map((f: FormDataEntryValue) => {
          return JSON.parse(f.toString());
        });

      let expirationDate: Date | null = null;
      let expires = formData.get("expires")?.toString();
      if (expires) {
        expirationDate = new Date(expires);
      }
      const alias = formData.get("alias")?.toString() ?? "";
      const existingAlias = await db.apiKeys.getApiKeyByAlias(tenantId, alias);
      if (existingAlias) {
        return { error: "API key with this alias already exists: " + alias };
      }
      const active = Boolean(formData.get("active"));
      const apiKey = await db.apiKeys.createApiKey(
        {
          tenantId: tenantId,
          createdByUserId: userInfo.userId,
          alias,
          expires: expirationDate,
          active,
        },
        entities
      );
      
      await EventsService.create({
        request,
        event: "api_key.created",
        tenantId: tenantId,
        userId: currentUser.id,
        data: {
          id: apiKey.id,
          alias: apiKey.alias,
          expires: expirationDate,
          active: active,
          entities: await getApiKeyEntityPermissions(entities),
          user: { id: currentUser?.id ?? "", email: currentUser?.email ?? "" },
        } satisfies ApiKeyCreatedDto,
      });
      
      await db.logs.createLog(request, tenantId, "API Key Created", JSON.stringify({ id: apiKey.id, alias, expirationDate, active, entities }));
      
      return {
        apiKey: {
          key: apiKey.key,
          alias: apiKey.alias,
        },
      };
    } else {
      return { error: t("shared.invalidForm") };
    }
  } catch (error) {
    // Re-throw redirect errors
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }
    console.error("Error creating API key:", error);
    return { error: error instanceof Error ? error.message : "An error occurred" };
  }
}
