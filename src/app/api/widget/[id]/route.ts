import invariant from "tiny-invariant";
import { NextRequest, NextResponse } from "next/server";
import { WidgetDataDto } from "@/modules/widgets/dtos/WidgetDto";
import WidgetUtils from "@/modules/widgets/utils/WidgetUtils";
import { prisma } from "@/db/config/prisma/database";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  invariant(params.id, "Widget ID is required");
  const widgetId = params.id;
  
  const widget = await prisma.widget.findUnique({
    where: {
      id: widgetId,
    },
  });
  
  if (!widget) {
    return NextResponse.json("Not found", { status: 404 });
  }

  const widgetDto = WidgetUtils.toDto(widget);
  console.log("/api/widget/" + widgetId, { widgetDto });

  return NextResponse.json(widgetDto);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  invariant(params.id, "Widget ID is required");
  const widgetId = params.id;
  
  const form = await request.formData();
  const action = form.get("action");
  
  if (action === "test-widget") {
    const content = form.get("content");
    let data: WidgetDataDto = {};
    
    if (content === "test-error") {
      data = {
        error: "Testing error",
      };
    } else {
      data = {
        success: "Content received: " + content,
      };
    }
    
    console.log("/api/widget/" + widgetId, { data });
    return NextResponse.json(data);
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
}
