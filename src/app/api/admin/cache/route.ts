import { NextRequest, NextResponse } from "next/server";
import { getCachedValues, clearAllCache, clearCacheKey } from "@/lib/services/cache.server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { db } from "@/db";

export async function GET() {
  try {
    await verifyUserHasPermission("admin.settings.general.update");
    
    const cachedValues = await getCachedValues();

    const allTenants = await db.tenants.adminGetAllTenantsIdsAndNames();
    const allUsers = await db.users.adminGetAllUsersNames();

    return NextResponse.json({
      cachedValues,
      allTenants,
      allUsers,
    });
  } catch (error) {
    console.error("Error fetching cache data:", error);
    return NextResponse.json({ error: "Failed to fetch cache data" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await verifyUserHasPermission("admin.settings.general.update");
    
    const formData = await request.formData();
    const action = formData.get("action")?.toString() ?? "";
    
    if (action === "delete-key") {
      const key = formData.get("key")?.toString() ?? "";
      await clearCacheKey(key);
      return NextResponse.json({ success: "Key deleted" });
    } else if (action === "delete-all") {
      await clearAllCache();
      return NextResponse.json({ success: "Cache cleared" });
    } else if (action === "delete-keys") {
      const keys = formData.get("keys")?.toString() ?? "";
      const keysArray = keys.split(",");
      let keyCount = 0;
      for (const key of keysArray) {
        await clearCacheKey(key);
        keyCount++;
      }
      return NextResponse.json({ success: "Keys deleted: " + keyCount });
    }
    
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error performing cache action:", error);
    return NextResponse.json({ error: "Failed to perform action" }, { status: 500 });
  }
}
