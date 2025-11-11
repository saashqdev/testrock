import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { getServerTranslations } from "@/i18n/server";
import { db } from "@/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ portal: string }> }
) {
  try {
    await requireAuth();
    const { t } = await getServerTranslations();
    
    const { portal } = await params;

    const item = await db.portals.getPortalById(null, portal);
    if (!item) {
      return NextResponse.json({ error: t("shared.notFound") }, { status: 404 });
    }

    const users = await db.portalUsers.getPortalUsers(item.id);
    const products = await db.portalSubscriptionProducts.getAllPortalSubscriptionProducts(item.id);
    
    if (users.length > 0) {
      return NextResponse.json({ error: "Cannot delete portal with users." }, { status: 400 });
    }
    
    if (products.length > 0) {
      return NextResponse.json({ error: "Cannot delete portal with products." }, { status: 400 });
    }
    
    await db.portals.deletePortal(item.id);

    return NextResponse.json({ success: t("shared.deleted") });
  } catch (error: any) {
    console.error("Error deleting portal:", error);
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 });
  }
}
