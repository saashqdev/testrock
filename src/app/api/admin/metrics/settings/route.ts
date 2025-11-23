import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/config/prisma/database";
import { db } from "@/db";
import { getServerTranslations } from "@/i18n/server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { RowValueMultipleDto } from "@/lib/dtos/entities/RowValueMultipleDto";

export async function POST(request: NextRequest) {
  try {
    await verifyUserHasPermission("admin.metrics.update");

    const { t } = await getServerTranslations();
    const body = await request.json();
    const action = body.action;

    if (action === "set-settings") {
      const ignoreUrls: string[] = Array.isArray(body.ignoreUrls)
        ? body.ignoreUrls
            .map((url: string | RowValueMultipleDto) => {
              if (typeof url === "string") {
                try {
                  const parsed = JSON.parse(url);
                  return parsed.value;
                } catch {
                  return url;
                }
              }
              return url.value;
            })
            .filter((url: string) => !!url)
        : [];

      await db.appConfiguration.updateAppConfiguration({
        metricsEnabled: body.enabled === true || body.enabled === "true",
        metricsLogToConsole: body.logToConsole === true || body.logToConsole === "true",
        metricsSaveToDatabase: body.saveToDatabase === true || body.saveToDatabase === "true",
        metricsIgnoreUrls: ignoreUrls.sort().join(","),
      });

      return NextResponse.json({ success: "Settings updated successfully" });
    } else if (action === "delete") {
      await verifyUserHasPermission("admin.metrics.delete");

      await prisma.metricLog.deleteMany({ where: {} });
      return NextResponse.json({ success: "Configuration reset successfully" });
    } else {
      return NextResponse.json({ error: t("shared.invalidForm") }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in metrics settings API:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
