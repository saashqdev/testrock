import { DefaultLogActions } from "@/lib/dtos/shared/DefaultLogActions";
import { db } from "@/db";

export namespace RowCommentsApi {
  export async function create(
    id: string,
    {
      comment,
      userId,
    }: {
      comment: string;
      userId: string;
    }
  ) {
    const item = await db.rows.getRowById(id);
    const entity = await db.entities.getEntityByIdOrName({ tenantId: null, id: item?.entityId });
    if (!item || !entity) {
      throw new Error("Row not found");
    }
    const created = await db.rowComments.createRowComment({
      createdByUserId: userId,
      rowId: id,
      value: comment,
    });
    await db.logs.createManualRowLog({
      tenantId: item.tenantId,
      createdByUserId: userId,
      action: DefaultLogActions.Commented,
      entity,
      item,
      commentId: created.id,
    });
    return created;
  }
}
