import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { getTenantIdFromUrl } from "@/utils/services/server/urlService";
import { db } from "@/db";

export async function GET(request: NextRequest, { params }: { params: Promise<{ tenant: string }> }) {
  try {
    await requireAuth();
    const resolvedParams = await params;
    const tenantId = await getTenantIdFromUrl(resolvedParams);

    const tenantUsers = await db.tenants.getTenantUsers(tenantId);

    return NextResponse.json({ tenantUsers });
  } catch (error) {
    console.error("Error fetching tenant users:", error);
    return NextResponse.json({ error: "Failed to fetch tenant users" }, { status: 500 });
  }
}
