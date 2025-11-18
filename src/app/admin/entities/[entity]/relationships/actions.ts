"use server";

import { db } from "@/db";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { revalidatePath } from "next/cache";

export async function setRelationshipOrders(entitySlug: string, orders: { id: string; order: number }[]) {
  await verifyUserHasPermission("admin.entities.update");

  await Promise.all(
    orders.map(async ({ id, order }) => {
      await db.entityRelationships.updateEntityRelationship(id, { order: Number(order) });
    })
  );

  revalidatePath(`/admin/entities/${entitySlug}/relationships`);
}
