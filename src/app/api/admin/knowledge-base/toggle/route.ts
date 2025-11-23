import { NextRequest, NextResponse } from "next/server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import KnowledgeBaseService from "@/modules/knowledgeBase/service/KnowledgeBaseService.server";
import { db } from "@/db";

export async function POST(request: NextRequest) {
  try {
    await verifyUserHasPermission("admin.kb.update");

    const formData = await request.formData();
    const id = formData.get("id")?.toString() ?? "";
    const enabled = formData.get("enabled")?.toString() === "true";

    const item = await KnowledgeBaseService.getById({ id, request });
    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await db.knowledgeBase.updateKnowledgeBase(id, {
      enabled,
    });

    return NextResponse.json({ success: "Updated" });
  } catch (error) {
    console.error("Error toggling knowledge base:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
