"use server";

import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import UrlUtils from "@/utils/app/UrlUtils";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { getTenantIdFromUrl } from "@/utils/services/server/urlService";
import { getUserInfo } from "@/lib/services/session.server";
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
  const userInfo = await getUserInfo();
  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  if (action === "create") {
    const data = {
      createdByUserId: userInfo.userId,
      tenantId: tenantId,
      name: form.get("name")?.toString() ?? "",
      description: form.get("description")?.toString() ?? "",
      color: Number(form.get("color")),
    };
    const group = await db.groups.createGroup(data);
    const userIds = form.getAll("users[]").map((f) => f.toString());
    const users = await db.users.getUsersById(userIds);
    await Promise.all(
      users.map(async (user) => {
        return await db.userGroups.createUserGroup(user.id, group.id);
      })
    );
    db.logs.createLog(
      request,
      tenantId,
      "Created",
      `${JSON.stringify({
        ...data,
        users: users.map((f) => f.email),
      })}`
    );
    return redirect(UrlUtils.currentTenantUrl(params, "settings/members"));
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }
}
