import { NextRequest, NextResponse } from "next/server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { getServerTranslations } from "@/i18n/server";
import { db } from "@/db";

export async function POST(request: NextRequest) {
  await verifyUserHasPermission("admin.entities.update");
  const { t } = await getServerTranslations();

  const formData = await request.formData();
  const action = formData.get("action")?.toString();

  if (action === "set-orders") {
    await verifyUserHasPermission("admin.entities.update");
    const items: { id: string; order: number }[] = formData.getAll("orders[]").map((f: FormDataEntryValue) => {
      return JSON.parse(f.toString());
    });

    await Promise.all(
      items.map(async ({ id, order }) => {
        await db.entityGroups.updateEntityGroup(id, { order: Number(order) });
      })
    );

    return NextResponse.json({ updated: true });
  } else if (action === "delete") {
    await verifyUserHasPermission("admin.entities.delete");
    const id = formData.get("id")?.toString() ?? "";
    await db.entityGroups.deleteEntityGroup(id);
    return NextResponse.json({ success: t("shared.deleted") });
  } else {
    return NextResponse.json({ error: t("shared.invalidForm") }, { status: 400 });
  }
}
