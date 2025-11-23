import { NextRequest, NextResponse } from "next/server";
import { getServerTranslations } from "@/i18n/server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { db } from "@/db";

export async function GET(request: NextRequest) {
  try {
    await verifyUserHasPermission("admin.prompts.create");

    const data = {
      allEntities: await db.entities.getAllEntities(null),
      promptFlowGroups: await db.promptFlowGroups.getAllPromptFlowGroups(),
    };

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { t } = await getServerTranslations();
    const formData = await request.formData();
    const action = formData.get("action")?.toString();

    if (action === "new") {
      const title = formData.get("title")?.toString() ?? "";
      const description = formData.get("description")?.toString() ?? "";
      const actionTitle = formData.get("actionTitle")?.toString();
      const model = formData.get("model")?.toString() ?? "gpt-3.5-turbo";
      const inputEntityId = formData.get("inputEntityId")?.toString() ?? null;
      const isPublic = Boolean(formData.get("isPublic"));

      if (!title || !model) {
        return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
      }

      try {
        const { id } = await db.promptFlows.createPromptFlow({
          model,
          stream: false,
          title,
          description,
          actionTitle: actionTitle ?? null,
          executionType: "sequential",
          promptFlowGroupId: null,
          inputEntityId: !inputEntityId?.length ? null : inputEntityId,
          isPublic: isPublic !== undefined ? isPublic : true,
          templates: [],
        });

        return NextResponse.json({
          success: true,
          redirect: `/admin/prompts/builder/${id}/templates`,
        });
      } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: t("shared.invalidForm") }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
