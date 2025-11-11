import { NextRequest } from "next/server";
import { prisma } from "@/db/config/prisma/database";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { getServerTranslations } from "@/i18n/server";

export async function POST(request: NextRequest) {
  try {
    await verifyUserHasPermission("admin.featureFlags.manage");
    
    await prisma.analyticsEvent.deleteMany({ where: { featureFlagId: { not: null } } });
    await prisma.featureFlag.deleteMany({});
    
    return Response.json({
      deleteSuccess: true,
    });
  } catch (error) {
    const { t } = await getServerTranslations();
    return Response.json(
      {
        error: error instanceof Error ? error.message : t("shared.invalidForm"),
      },
      { status: 400 }
    );
  }
}
