import { NextRequest } from "next/server";
import { getServerTranslations } from "@/i18n/server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { db } from "@/db";

export async function POST(request: NextRequest) {
  try {
    await verifyUserHasPermission(request as any, "admin.blacklist.manage");
    const { t } = await getServerTranslations();

    const formData = await request.formData();
    const action = formData.get("action")?.toString();

    if (action === "create") {
      await db.blacklist.addToBlacklist({
        type: formData.get("type")?.toString() ?? "",
        value: formData.get("value")?.toString() ?? "",
      });
      return Response.json({ success: true });
    } else if (action === "delete") {
      await db.blacklist.deleteFromBlacklist({
        type: formData.get("type")?.toString() ?? "",
        value: formData.get("value")?.toString() ?? "",
      });
      return Response.json({ success: true });
    } else {
      return Response.json({ error: t("shared.invalidForm") }, { status: 400 });
    }
  } catch (error) {
    console.error("Blacklist API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
