import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await verifyUserHasPermission("admin.entities.view");
    
    const item = await db.entityViews.getEntityViewWithTenantAndUser(id);
    
    if (!item) {
      return NextResponse.json({ error: "Entity view not found" }, { status: 404 });
    }
    
    return NextResponse.json(item);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
