import { IRowTagsDb } from "@/db/interfaces/entityBuilder/IRowTagsDb";
import { prisma } from "@/db/config/prisma/database";
import { RowTagWithDetailsDto } from "@/db/models/entityBuilder/RowTagsModel";
export class RowTagsDbPrisma implements IRowTagsDb {
  async getRowTags(rowId: string): Promise<RowTagWithDetailsDto[]> {
    return await prisma.rowTag.findMany({
      where: {
        rowId,
      },
      include: {
        tag: true,
      },
    });
  }

  async getRowTagById(id: string): Promise<RowTagWithDetailsDto | null> {
    return await prisma.rowTag.findUnique({
      where: {
        id,
      },
      include: {
        tag: true,
      },
    });
  }

  async getRowTag(rowId: string, value: string): Promise<RowTagWithDetailsDto | null> {
    return await prisma.rowTag.findFirst({
      where: {
        rowId,
        tag: {
          value,
        },
      },
      include: {
        tag: true,
      },
    });
  }

  async getRowTagByIds(rowId: string, tagId: string): Promise<RowTagWithDetailsDto | null> {
    return await prisma.rowTag.findFirst({
      where: {
        rowId,
        tagId,
      },
      include: {
        tag: true,
      },
    });
  }

  async createRowTag(data: { rowId: string; tagId: string }) {
    return await prisma.rowTag.create({
      data,
    });
  }

  async deleteRowTag(id: string) {
    return await prisma.rowTag.delete({
      where: {
        id,
      },
    });
  }

  async deleteRowTags(rowId: string, tagId: string) {
    return await prisma.rowTag.deleteMany({
      where: {
        rowId,
        tagId,
      },
    });
  }
}
