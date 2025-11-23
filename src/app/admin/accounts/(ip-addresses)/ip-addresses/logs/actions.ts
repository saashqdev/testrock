"use server";

import { db } from "@/db";
import { prisma } from "@/db/config/prisma/database";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { revalidatePath } from "next/cache";

export async function blacklistIp(ip: string) {
  try {
    await verifyUserHasPermission("admin.tenantIpAddress.view");

    const existing = await db.blacklist.findInBlacklist("ip", ip);
    if (existing) {
      return { error: "IP address is already blacklisted." };
    }

    await db.blacklist.addToBlacklist({
      type: "ip",
      value: ip,
    });

    revalidatePath("/admin/accounts/ip-addresses/logs");
    return { success: "IP address has been blacklisted." };
  } catch (error) {
    return { error: "Failed to blacklist IP address." };
  }
}

export async function deleteLog(id: string) {
  try {
    await verifyUserHasPermission("admin.tenantIpAddress.view");

    await prisma.ipAddressLog.delete({ where: { id } });

    revalidatePath("/admin/accounts/ip-addresses/logs");
    return { success: "Log has been deleted." };
  } catch (error) {
    return { error: "Failed to delete log." };
  }
}

export async function deleteLogs(ids: string[]) {
  try {
    await verifyUserHasPermission("admin.tenantIpAddress.view");

    const deleted = await prisma.ipAddressLog.deleteMany({ where: { id: { in: ids } } });

    revalidatePath("/admin/accounts/ip-addresses/logs");
    return { success: `${deleted.count} logs have been deleted.` };
  } catch (error) {
    return { error: "Failed to delete logs." };
  }
}
