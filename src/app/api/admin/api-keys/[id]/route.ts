import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import { getApiKeyEntityPermissions } from "@/lib/helpers/server/ApiKeyHelperService";
import EventsService from "@/modules/events/services/server/EventsService";
import { getUserInfo } from "@/lib/services/session.server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { ApiKeyDeletedDto } from "@/modules/events/dtos/ApiKeyDeletedDto";
import { ApiKeyUpdatedDto } from "@/modules/events/dtos/ApiKeyUpdatedDto";
import { db } from "@/db";
import { NextRequest } from "next/server";

type ActionData = {
  error?: string;
};
const badRequest = (data: ActionData) => Response.json(data, { status: 400 });

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await verifyUserHasPermission("admin.apiKeys.update");
  const { t } = await getServerTranslations();
  const userInfo = await getUserInfo();
  const currentUser = await db.users.getUser(userInfo.userId);

  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  const existing = await db.apiKeys.getApiKeyById(id);
  if (!existing) {
    return badRequest({ error: t("shared.notFound") });
  }
  if (action === "edit") {
    await verifyUserHasPermission("admin.apiKeys.update");
    const entities: { entityId: string; create: boolean; read: boolean; update: boolean; delete: boolean }[] = form
      .getAll("entities[]")
      .map((f: FormDataEntryValue) => {
        return JSON.parse(f.toString());
      });
    let expirationDate: Date | null = null;
    let expires = form.get("expires")?.toString();
    if (expires) {
      expirationDate = new Date(expires);
    }
    const tenantId = form.get("tenant-id")?.toString() ?? "";
    const alias = form.get("alias")?.toString() ?? "";
    const existingAlias = await db.apiKeys.getApiKeys(tenantId);
    if (existingAlias.filter((f) => f.id !== existing.id && f.alias === alias).length > 0) {
      return badRequest({ error: "API key with this alias already exists: " + alias });
    }
    const active = Boolean(form.get("active"));
    await db.apiKeys.updateApiKey(
      id,
      {
        tenantId,
        alias,
        expires: expirationDate,
        active,
      },
      entities
    );
    await db.logs.createAdminLog(request as any, "API Key Updated", JSON.stringify({ tenantId, alias, expirationDate, active, entities }));
    await EventsService.create({
      request: request as any,
      event: "api_key.updated",
      tenantId,
      userId: currentUser?.id ?? null,
      data: {
        id: existing.id,
        new: {
          alias: alias,
          expires: expirationDate,
          active: active,
          entities: await getApiKeyEntityPermissions(entities),
        },
        old: {
          alias: existing.alias,
          expires: existing.expires,
          active: existing.active,
          entities: await getApiKeyEntityPermissions(existing.entities),
        },
        user: { id: currentUser?.id ?? "", email: currentUser?.email ?? "" },
      } satisfies ApiKeyUpdatedDto,
    });
    return redirect(`/admin/api/keys`);
  } else if (action === "delete") {
    await verifyUserHasPermission("admin.apiKeys.delete");
    await db.apiKeys.deleteApiKey(id);
    await db.logs.createAdminLog(request as any, "API Key Deleted", "");
    await EventsService.create({
      request: request as any,
      event: "api_key.deleted",
      tenantId: existing.tenantId,
      userId: currentUser?.id ?? null,
      data: {
        id: existing.id,
        alias: existing.alias,
        expires: existing.expires,
        active: existing.active,
        entities: await getApiKeyEntityPermissions(existing.entities),
        user: { id: currentUser?.id ?? "", email: currentUser?.email ?? "" },
      } satisfies ApiKeyDeletedDto,
    });
    return redirect(`/admin/api/keys`);
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }
}
