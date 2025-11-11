import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { verifyUserHasPermission } from "@/modules/permissions/services/UserPermissionsService";
import { getServerTranslations } from "@/i18n/server";
import { TenantTypeDto } from "@/lib/dtos/tenants/TenantTypeDto";

export async function GET() {
  try {
    await verifyUserHasPermission("admin.accountTypes.view");
    
    const types: TenantTypeDto[] = await db.tenantTypes.getAllTenantTypes();
    const subscriptionProducts = await db.subscriptionProducts.getAllSubscriptionProducts();
    const allTenants = await db.tenants.getAllTenantsWithoutTypes();
    
    types.unshift({
      title: "Default",
      titlePlural: "Default",
      description: null,
      isDefault: true,
      subscriptionProducts: subscriptionProducts
        .filter((f) => !f.assignsTenantTypes || f.assignsTenantTypes?.length === 0)
        .map((f) => ({ id: f.id, title: f.title })),
      _count: { tenants: allTenants.length },
    });

    return NextResponse.json({ types });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch types" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await verifyUserHasPermission("admin.accountTypes.update");
    const { t } = await getServerTranslations();
    const formData = await request.formData();
    const action = formData.get("action")?.toString();

    if (action === "delete") {
      await verifyUserHasPermission("admin.accountTypes.delete");
      const id = formData.get("id")?.toString() ?? "";
      await db.tenantTypes.deleteTenantType(id);
      return NextResponse.json({ success: t("shared.deleted") });
    } else {
      return NextResponse.json({ error: t("shared.invalidForm") }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
