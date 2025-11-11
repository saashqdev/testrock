import { IRowCommentsDb } from "@/db/interfaces/entityBuilder/IRowCommentsDb";
import { prisma } from "@/db/config/prisma/database";
import { RowCommentWithDetailsDto } from "@/db/models/entityBuilder/RowCommentsModel";
import UserModelHelper from "@/lib/helpers/models/UserModelHelper";

export class RowCommentsDbPrisma implements IRowCommentsDb {
  async getRowComments(rowId: string): Promise<RowCommentWithDetailsDto[]> {
    return await prisma.rowComment.findMany({
      where: {
        rowId,
        // parentCommentId: null,
      },
      include: {
        ...UserModelHelper.includeSimpleCreatedByUser,
        reactions: {
          include: {
            ...UserModelHelper.includeSimpleCreatedByUser,
          },
        },
        // replies: {
        //   include: {
        //     ...UserModelHelper.includeSimpleCreatedByUser,
        //   },
        // },
      },
    });
  }

  async getRowComment(id: string): Promise<RowCommentWithDetailsDto | null> {
    return await prisma.rowComment.findUnique({
      where: {
        id,
      },
      include: {
        ...UserModelHelper.includeSimpleCreatedByUser,
        reactions: {
          include: {
            ...UserModelHelper.includeSimpleCreatedByUser,
          },
        },
        // replies: {
        //   include: {
        //     ...UserModelHelper.includeSimpleCreatedByUser,
        //   },
        // },
      },
    });
  }

  async createRowComment(data: { createdByUserId: string; rowId: string; value: string }) {
    return await prisma.rowComment.create({
      data,
    });
  }

  async updateRowComment(id: string, data: { value?: string; isDeleted?: boolean }) {
    return await prisma.rowComment.update({
      where: {
        id,
      },
      data,
    });
  }

  async deleteRowComment(id: string) {
    return await prisma.rowComment.delete({
      where: {
        id,
      },
    });
  }
}
