import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { db } from "@/db";

export async function POST(request: NextRequest, { params }: { params: Promise<{ portal: string; userId: string }> }) {
  try {
    await requireAuth();

    const { portal, userId } = await params;
    const formData = await request.formData();

    const firstName = formData.get("firstName")?.toString();
    const lastName = formData.get("lastName")?.toString();
    const avatar = formData.get("avatar")?.toString();

    const portalData = await db.portals.getPortalById(null, portal);
    if (!portalData) {
      return NextResponse.json({ error: "Portal not found" }, { status: 404 });
    }

    const user = await db.portalUsers.getPortalUserById(portalData.id, userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await db.portalUsers.updatePortalUser(user.id, {
      firstName,
      lastName,
      avatar,
    });

    return NextResponse.json({ success: "User updated successfully" });
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 });
  }
}
