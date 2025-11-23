import { NextRequest, NextResponse } from "next/server";
import { getServerTranslations } from "@/i18n/server";
import { db } from "@/db";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { PromptFlowWithDetailsDto } from "@/db/models/promptFlows/PromptFlowsModel";
import { PromptFlowOutputWithDetailsDto } from "@/db/models/promptFlows/PromptFlowOutputsModel";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";

type LoaderData = {
  item: PromptFlowWithDetailsDto;
  items: PromptFlowOutputWithDetailsDto[];
  allEntities: EntityWithDetailsDto[];
};

// GET handler - Load data
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    await verifyUserHasPermission("admin.prompts.update");

    const item = await db.promptFlows.getPromptFlow(id);
    if (!item) {
      return NextResponse.json({ error: "Prompt flow not found" }, { status: 404 });
    }

    const items = await db.promptFlowOutput.getPromptFlowOutputs(item.id);
    const allEntities = await db.entities.getAllEntities(null);

    const data: LoaderData = {
      item,
      items,
      allEntities,
    };

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error loading prompt flow outputs:", error);
    return NextResponse.json({ error: error.message || "Failed to load data" }, { status: 500 });
  }
}

// POST handler - Handle actions
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { t } = await getServerTranslations();

    await verifyUserHasPermission("admin.prompts.update");

    const item = await db.promptFlows.getPromptFlow(id);
    if (!item) {
      return NextResponse.json({ error: "Prompt flow not found" }, { status: 404 });
    }

    const body = await request.json();
    const action = body.action;

    if (action === "delete-output") {
      const outputId = body.id ?? "";
      try {
        await db.promptFlowOutput.deletePromptFlowOutput(outputId);
        return NextResponse.json({ success: t("shared.deleted") });
      } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 });
      }
    } else if (action === "delete-output-mapping") {
      const mappingId = body.id ?? "";
      try {
        await db.promptFlowOutputMapping.deletePromptFlowOutputMapping(mappingId);
        return NextResponse.json({ success: t("shared.deleted") });
      } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: t("shared.invalidForm") }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Error processing action:", error);
    return NextResponse.json({ error: error.message || "Failed to process action" }, { status: 500 });
  }
}
