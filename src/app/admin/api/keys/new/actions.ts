"use server";

import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import { getApiKeyEntityPermissions } from "@/lib/helpers/server/ApiKeyHelperService";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import EventsService from "@/modules/events/services/server/EventsService";
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

export async function createApiKey(prevState: ActionData | null, formData: FormData): Promise<ActionData> {
  try {
    const userInfo = await getUserInfo();
    await verifyUserHasPermission("admin.apiKeys.create");
    
    const { t } = await getServerTranslations();
    const currentUser = await db.users.getUser(userInfo.userId);

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
      const tenantId = formData.get("tenant-id")?.toString() ?? "";
      const alias = formData.get("alias")?.toString() ?? "";
      const existingAlias = await db.apiKeys.getApiKeyByAlias(tenantId, alias);
      if (existingAlias) {
        return { error: "API key with this alias already exists: " + alias };
      }
      const active = Boolean(formData.get("active"));
      const apiKey = await db.apiKeys.createApiKey(
        {
          tenantId,
          createdByUserId: userInfo.userId,
          alias,
          expires: expirationDate,
          active,
        },
        entities
      );
      await db.logs.createAdminLog(null as any, "API Key Created", JSON.stringify({ id: apiKey.id, tenantId, alias, expirationDate, active, entities }));
      await EventsService.create({
        request: null as any,
        event: "api_key.created",
        tenantId,
        userId: currentUser?.id ?? "",
        data: {
          id: apiKey.id,
          alias: apiKey.alias,
          expires: expirationDate,
          active: active,
          entities: await getApiKeyEntityPermissions(entities),
          user: { id: currentUser?.id ?? "", email: currentUser?.email ?? "" },
        } satisfies ApiKeyCreatedDto,
      });
      redirect("/admin/api/keys");
    } else {
      return { error: t("shared.invalidForm") };
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }
    return { error: error instanceof Error ? error.message : "An error occurred" };
  }
}
