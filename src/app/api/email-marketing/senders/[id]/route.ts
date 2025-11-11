import { NextRequest, NextResponse } from "next/server";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { db } from "@/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Note: You may need to adapt the requireAuth function for Next.js API routes
    // await requireAuth();
    
    const tenantId = await getTenantIdOrNull({ request, params });
    const item = await db.emailSenders.getEmailSenderWithoutApiKey(params.id, tenantId);
    
    if (!item) {
      return NextResponse.json({ error: "Sender not found" }, { status: 404 });
    }
    
    return NextResponse.json({ item });
  } catch (error) {
    console.error("Error fetching email sender:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}