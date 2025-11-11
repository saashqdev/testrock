"use server";

import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { prisma } from "@/db/config/prisma/database";
import { db } from "@/db";
import { clearCacheKey } from "@/lib/services/cache.server";

export async function blacklistIp(ip: string) {
  await verifyUserHasPermission("admin.tenantIpAddress.view");

  const existing = await db.blacklist.findInBlacklist("ip", ip);
  if (existing) {
    return { error: "IP address is already blacklisted." };
  }

  await db.blacklist.addToBlacklist({
    type: "ip",
    value: ip,
  });
  
  return { success: "IP address has been blacklisted." };
}

export async function deleteIpAddress(id: string) {
  await verifyUserHasPermission("admin.tenantIpAddress.view");

  await prisma.ipAddress.delete({ where: { id } }).then((item) => {
    clearCacheKey(`ipAddress:${item.ip}`);
  });
  
  return { success: "IP address has been deleted." };
}
