import { CodeGeneratorOptions } from "@/modules/codeGenerator/service/CodeGeneratorService";
import * as CodeGeneratorService from "@/modules/codeGenerator/service/CodeGeneratorService";
import { db } from "@/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ entity: string }> }) {
  try {
    const { entity: entityName } = await params;
    const entity = await db.entities.getEntityByName({
      tenantId: null,
      name: entityName,
    });

    if (!entity) {
      return NextResponse.json({ error: "Entity not found." }, { status: 404 });
    }

    const body = (await request.json()) as CodeGeneratorOptions;
    const file = await CodeGeneratorService.generate(body);

    // if (!file) {
    //   return NextResponse.json(
    //     { success: "Files generated successfully." },
    //     { status: 200 }
    //   );
    // }

    return new NextResponse(null, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename=${entity.slug}.zip`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
