import { NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { db } from "@/db";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; output: string; mapping: string }> }) {
  const { id, mapping } = await params;
  const body = await request.json();
  const action = body.action;

  const item = await db.promptFlowOutputMapping.getPromptFlowOutputMapping(mapping);
  if (!item) {
    return Response.json({ error: "Mapping not found" }, { status: 404 });
  }

  if (action === "edit") {
    try {
      const promptTemplateId = body.promptTemplateId ?? "";
      const propertyId = body.propertyId ?? "";
      if (!promptTemplateId || !propertyId) {
        throw Error("Prompt template and property are required");
      }
      await db.promptFlowOutputMapping.updatePromptFlowOutputMapping(item.id, {
        promptTemplateId,
        propertyId,
      });
      return Response.json({ success: true });
    } catch (e: any) {
      return Response.json({ error: e.message }, { status: 400 });
    }
  } else if (action === "delete") {
    try {
      await db.promptFlowOutputMapping.deletePromptFlowOutputMapping(item.id);
      return Response.json({ success: true });
    } catch (e: any) {
      return Response.json({ error: e.message }, { status: 400 });
    }
  } else {
    return Response.json({ error: "Invalid action" }, { status: 400 });
  }
}
