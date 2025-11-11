import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { getServerTranslations } from "@/i18n/server";
import ApiKeyLogService from "@/modules/api/services/ApiKeyLogService";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  await verifyUserHasPermission("admin.apiKeys.update");
  const { t } = await getServerTranslations();
  const form = await request.formData();
  if (form.get("action") === "delete") {
    await verifyUserHasPermission("admin.apiKeys.delete");
    const ids = (form.get("ids")?.toString().split(",") ?? []).map((x) => x.toString() ?? "");
    await ApiKeyLogService.deleteMany(ids);
    return Response.json({ success: true });
  } else {
    return Response.json({ error: t("shared.invalidForm"), success: false }, { status: 400 });
  }
}
