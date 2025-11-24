"use server";

import { db } from "@/db";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";

export async function setEntityOrders(formData: FormData) {
  await verifyUserHasPermission("admin.entities.update");

  const orders = formData.getAll("orders[]");
  
  await Promise.all(
    orders.map(async (orderStr) => {
      const { id, order } = JSON.parse(orderStr.toString());
      await db.entities.updateEntity({ id, order: Number(order) });
    })
  );

  return { success: true };
}
