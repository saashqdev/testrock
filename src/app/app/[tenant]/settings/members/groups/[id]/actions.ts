"use server";

import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import UrlUtils from "@/utils/app/UrlUtils";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { getTenantIdFromUrl } from "@/utils/services/server/urlService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

type ActionData = {
  error?: string;
};
const badRequest = (data: ActionData) => Response.json(data, { status: 400 });

export async function action(props: IServerComponentsProps) {
  const params = (await props.params) || {};
  const request = props.request!;
  await requireAuth();
  const { t } = await getServerTranslations();
  const tenantId = await getTenantIdFromUrl(params);

  const existing = await db.groups.getGroup(params.id ?? "");
  if (!existing) {
    throw redirect(UrlUtils.currentTenantUrl(params, "settings/members"));
  }

  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  if (action === "edit") {
    const data = {
      tenantId: tenantId,
      name: form.get("name")?.toString() ?? "",
      description: form.get("description")?.toString() ?? "",
      color: Number(form.get("color")),
    };
    await db.groups.updateGroup(existing.id, data);
    await db.userGroups.deleteGroupUsers(existing.id);
    const userIds = form.getAll("users[]").map((f) => f.toString());
    const users = await db.users.getUsersById(userIds);
    await Promise.all(
      users.map(async (user) => {
        return await db.userGroups.createUserGroup(user.id, existing.id);
      })
    );
    db.logs.createLog(request, tenantId, "Updated", `${existing.name}: ${JSON.stringify({ ...data, users: users.map((f) => f.email) })}`);
  } else if (action === "delete") {
    await db.groups.deleteGroup(existing.id);
    db.logs.createLog(request, tenantId, "Deleted", `${existing.name}`);
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }
  return redirect(UrlUtils.currentTenantUrl(params, "settings/members"));
}
