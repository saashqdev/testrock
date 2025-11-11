"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@/db";
import { prisma } from "@/db/config/prisma/database";
import UrlUtils from "@/utils/app/UrlUtils";
import { cachified, clearCacheKey } from "@/lib/services/cache.server";
import { Params } from "@/types";

export async function getTenantIdFromUrl(params: Params) {
  const tenant = params;
  let tenantId = "";
  let tenantFromParams = await cachified({
    key: `tenantIdOrSlug:${tenant}`,
    ttl: 1000 * 60 * 60 * 24,
    getFreshValue: () => db.tenants.getTenantByIdOrSlug(String(tenant)),
  });
  if (!tenantFromParams) {
    tenantFromParams = await db.tenants.getTenantByIdOrSlug(String(tenant));
    if (tenantFromParams) {
      clearCacheKey(`tenant:${tenant}`);
      clearCacheKey(`tenant:${tenantFromParams}`);
      clearCacheKey(`tenantIdOrSlug:${tenant}`);
      clearCacheKey(`tenantIdOrSlug:${tenantFromParams}`);
      clearCacheKey(`tenantSimple:${tenantFromParams}`);
    }
  }
  if (tenantFromParams) {
    tenantId = tenantFromParams.id;
    if (!tenantId) {
      // eslint-disable-next-line no-console
      console.log("[urlService] Redirecting to /app");
      throw redirect("/app");
    }
  }
  return tenantId;
}

export async function getTenantIdOrNull({ request, params }: { request?: Request; params: Params }) {
  const { tenant } = params;
  
  // Get URL from request or headers
  let currentPath: string;
  if (request) {
    currentPath = new URL(request.url).pathname.toLowerCase();
  } else {
    // In Next.js 15 App Router, use headers to get the pathname
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || headersList.get("x-url");
    if (!pathname) {
      return null;
    }
    currentPath = pathname.toLowerCase();
  }
  if (currentPath.startsWith("/admin")) {
    return null;
  } else if (currentPath.startsWith("/app") && UrlUtils.stripTrailingSlash(currentPath) !== "/app") {
    if (!tenant) {
      // eslint-disable-next-line no-console
      console.log("[urlService] getTenantIdOrNull(): Redirecting to /app");
      throw redirect("/app");
    }
    const tenantFromParams = await db.tenants.getTenantByIdOrSlug(String(tenant));
    if (!tenantFromParams) {
      // eslint-disable-next-line no-console
      console.log("[urlService] getTenantIdOrNull(): Redirecting to /app");
      throw redirect("/app");
    }
    return tenantFromParams.id;
  }
  return null;
}

export async function getTenantByIdOrSlug(tenant: string | undefined) {
  return (
    (
      await prisma.tenant.findFirst({
        where: { OR: [{ slug: tenant }, { id: tenant }] },
        select: { id: true },
      })
    )?.id ?? ""
  );
}
