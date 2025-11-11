import { NextRequest, NextResponse } from "next/server";
import { getServerTranslations } from "@/i18n/server";
import { prisma } from "@/db/config/prisma/database";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";

export async function POST(request: NextRequest) {
  try {
    await verifyUserHasPermission("admin.metrics.update");
    const { t } = await getServerTranslations();

    const formData = await request.formData();
    const action = formData.get("action")?.toString();

    if (action === "delete") {
      await verifyUserHasPermission("admin.metrics.delete");
      const ids = (formData.get("ids")?.toString().split(",") ?? []).map((x) => x.toString() ?? "");
      await prisma.metricLog.deleteMany({
        where: { id: { in: ids } },
      });
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: t("shared.invalidForm"), success: false }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in metrics logs API:", error);
    return NextResponse.json({ error: "An error occurred", success: false }, { status: 500 });
  }
}
