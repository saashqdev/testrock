import { NextRequest, NextResponse } from "next/server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { validateEntitiesFromTemplate } from "@/utils/services/server/entitiesTemplatesService";
import { EntitiesTemplateDto } from "@/modules/templates/EntityTemplateDto";

export async function POST(request: NextRequest) {
  try {
    await verifyUserHasPermission("admin.entities.create");

    const body = await request.json();
    const { configuration } = body;

    const previewTemplate = JSON.parse(configuration) as EntitiesTemplateDto;
    await validateEntitiesFromTemplate(previewTemplate);

    return NextResponse.json({
      previewTemplate,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
