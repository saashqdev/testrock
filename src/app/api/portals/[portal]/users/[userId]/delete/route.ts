import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { db } from "@/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ portal: string; userId: string }> }
) {
  try {
    await requireAuth();
    
    const { portal, userId } = await params;

    const portalData = await db.portals.getPortalById(null, portal);
    if (!portalData) {
      return NextResponse.json({ error: "Portal not found" }, { status: 404 });
    }

    const user = await db.portalUsers.getPortalUserById(portalData.id, userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await db.portalUsers.deletePortalUser(portalData.id, user.id);

    return NextResponse.json({ success: "User deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 });
  }
}
