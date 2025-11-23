import { NextRequest, NextResponse } from "next/server";
import { getServerTranslations } from "@/i18n/server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import PromptBuilderService from "@/modules/promptBuilder/services/server/PromptBuilderService";

export async function POST(request: NextRequest) {
  const { t } = await getServerTranslations();
  const formData = await request.formData();
  const action = formData.get("action")?.toString();

  try {
    if (action === "createDefault") {
      await verifyUserHasPermission("admin.prompts.create");
      const promptTitle = formData.get("promptTitle")?.toString() ?? "";
      await PromptBuilderService.createDefault(promptTitle);
      return NextResponse.json({ success: t("shared.success") });
    } else {
      return NextResponse.json({ error: t("shared.invalidForm") }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in prompt builder API:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : t("shared.error") }, { status: 500 });
  }
}
