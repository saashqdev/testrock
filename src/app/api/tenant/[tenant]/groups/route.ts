import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { getTenantIdFromUrl } from "@/utils/services/server/urlService";
import { getUserInfo } from "@/lib/services/session.server";
import { getServerTranslations } from "@/i18n/server";
import { db } from "@/db";

export async function POST(request: NextRequest, { params }: { params: Promise<{ tenant: string }> }) {
  try {
    await requireAuth();
    const { t } = await getServerTranslations();
    const resolvedParams = await params;
    const tenantId = await getTenantIdFromUrl(resolvedParams);
    const userInfo = await getUserInfo();

    const formData = await request.formData();
    const action = formData.get("action")?.toString() ?? "";

    if (action === "create") {
      const data = {
        createdByUserId: userInfo.userId,
        tenantId: tenantId,
        name: formData.get("name")?.toString() ?? "",
        description: formData.get("description")?.toString() ?? "",
        color: Number(formData.get("color")),
      };

      const group = await db.groups.createGroup(data);
      const userIds = formData.getAll("users[]").map((f) => f.toString());
      const users = await db.users.getUsersById(userIds);

      await Promise.all(
        users.map(async (user) => {
          return await db.userGroups.createUserGroup(user.id, group.id);
        })
      );

      await db.logs.createLog(
        request,
        tenantId,
        "Created",
        `${JSON.stringify({
          ...data,
          users: users.map((f) => f.email),
        })}`
      );

      return NextResponse.json({ success: true, group });
    } else {
      return NextResponse.json({ error: t("shared.invalidForm") }, { status: 400 });
    }
  } catch (error) {
    console.error("Error creating group:", error);
    return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
  }
}
