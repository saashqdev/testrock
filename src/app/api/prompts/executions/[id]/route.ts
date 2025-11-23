import { NextRequest, NextResponse } from "next/server";
import { getServerTranslations } from "@/i18n/server";
import { db } from "@/db";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { t } = await getServerTranslations();
  const { id } = await params;

  try {
    const execution = await db.promptExecutions.getPromptFlowExecution(id);
    if (!execution) {
      return NextResponse.json({ error: t("shared.notFound") }, { status: 404 });
    }

    await db.promptExecutions.deletePromptFlowExecution(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting execution:", error);
    return NextResponse.json({ error: t("shared.error") }, { status: 500 });
  }
}
