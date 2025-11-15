import { NextRequest, NextResponse } from "next/server";
import { RowsApi } from "@/utils/api/server/RowsApi";
import { EntitiesApi } from "@/utils/api/server/EntitiesApi";
import { getTenantIdFromUrl as getTenantIdFromUrlService } from "@/modules/accounts/services/TenantService";
import { getUserInfo } from "@/lib/services/session.server";
import EntitiesSingleton from "@/modules/rows/repositories/EntitiesSingleton";
import { loadEntities } from "@/modules/rows/repositories/server/EntitiesSingletonService";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const entitySlug = searchParams.get("entity");
    const tenant = searchParams.get("tenant");
    
    if (!entitySlug) {
      return NextResponse.json(
        { error: "Entity parameter is required" },
        { status: 400 }
      );
    }

    await loadEntities();
    const userInfo = await getUserInfo();
    const tenantData = tenant ? await getTenantIdFromUrlService(tenant) : null;
    const tenantId = tenantData?.id ?? null;
    
    const entity = EntitiesSingleton.getEntityByIdNameOrSlug(entitySlug);
    if (!entity) {
      return NextResponse.json(
        { error: `Entity not found: ${entitySlug}` },
        { status: 404 }
      );
    }
    
    // Remove entity and tenant from search params
    const urlSearchParams = new URLSearchParams(searchParams);
    urlSearchParams.delete("entity");
    urlSearchParams.delete("tenant");
    
    const rowsData = await RowsApi.getAll({
      entity,
      tenantId,
      userId: userInfo.userId,
      urlSearchParams,
    });
    
    const routes = EntitiesApi.getNoCodeRoutes({
      params: { tenant: tenant ?? undefined },
    });
    
    return NextResponse.json({ rowsData, routes });
  } catch (error: any) {
    console.error("Error fetching rows data:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
