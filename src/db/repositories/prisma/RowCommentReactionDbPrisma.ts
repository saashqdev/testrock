import { IRowCommentReactionDb } from "@/db/interfaces/entityBuilder/IRowCommentReactionDb";
import { prisma } from "@/db/config/prisma/database";

export class RowCommentReactionDbPrisma implements IRowCommentReactionDb {
  async setRowCommentReaction(data: { createdByUserId: string; rowCommentId: string; reaction: string }) {
    const existing = await prisma.rowCommentReaction.findFirst({
      where: {
        createdByUserId: data.createdByUserId,
        rowCommentId: data.rowCommentId,
        reaction: data.reaction,
      },
    });
    if (!existing) {
      await prisma.rowCommentReaction.create({
        data,
      });
      return true;
    } else {
      await prisma.rowCommentReaction.deleteMany({
        where: {
          ...data,
        },
      });
      return false;
    }
  }
}
