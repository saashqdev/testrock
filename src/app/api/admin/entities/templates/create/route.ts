import { NextRequest, NextResponse } from "next/server";
import { getServerTranslations } from "@/i18n/server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { importEntitiesFromTemplate } from "@/utils/services/server/entitiesTemplatesService";
import { getUserInfo } from "@/lib/services/session.server";
import { EntitiesTemplateDto } from "@/modules/templates/EntityTemplateDto";

export async function POST(request: NextRequest) {
  try {
    await verifyUserHasPermission("admin.entities.create");
    const { t } = await getServerTranslations();
    const userInfo = await getUserInfo();

    const body = await request.json();
    const { configuration } = body;

    const template = JSON.parse(configuration) as EntitiesTemplateDto;
    const entities = await importEntitiesFromTemplate({
      template,
      createdByUserId: userInfo.userId,
    });

    return NextResponse.json({
      success: `Created entities: ${entities.map((e) => t(e.titlePlural)).join(", ")}`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
