import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { db } from "@/db";
import bcrypt from "bcryptjs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ portal: string }> }
) {
  try {
    await requireAuth();
    
    const { portal } = await params;
    const formData = await request.formData();
    
    const email = formData.get("email")?.toString();
    const firstName = formData.get("firstName")?.toString();
    const lastName = formData.get("lastName")?.toString();
    const password = formData.get("password")?.toString();
    const avatar = formData.get("avatar")?.toString();
    const portalId = formData.get("portalId")?.toString();

    if (!email || !password || !firstName || !portalId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const portalData = await db.portals.getPortalById(null, portal);
    if (!portalData || portalData.id !== portalId) {
      return NextResponse.json({ error: "Portal not found" }, { status: 404 });
    }

    const existingUser = await db.portalUsers.getPortalUserByEmail(portalData.id, email);
    if (existingUser) {
      return NextResponse.json({ error: "User already exists with that email" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await db.portalUsers.createPortalUser({
      tenantId: portalData.tenantId,
      portalId: portalData.id,
      email,
      passwordHash,
      firstName,
      lastName: lastName ?? "",
      avatar: avatar ?? null,
    });

    return NextResponse.json({ success: "User created successfully" });
  } catch (error: any) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 });
  }
}
