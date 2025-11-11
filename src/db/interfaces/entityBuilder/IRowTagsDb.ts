import { RowTagWithDetailsDto } from "@/db/models/entityBuilder/RowTagsModel";
import { Prisma } from "@prisma/client";
export interface IRowTagsDb {
  getRowTags(rowId: string): Promise<RowTagWithDetailsDto[]>;
  getRowTagById(id: string): Promise<RowTagWithDetailsDto | null>;
  getRowTag(rowId: string, value: string): Promise<RowTagWithDetailsDto | null>;
  getRowTagByIds(rowId: string, tagId: string): Promise<RowTagWithDetailsDto | null>;
  createRowTag(data: { rowId: string; tagId: string }): Promise<{ id: string; createdAt: Date; rowId: string; tagId: string }>;
  deleteRowTag(id: string): Promise<{ id: string; createdAt: Date; rowId: string; tagId: string }>;
  deleteRowTags(rowId: string, tagId: string): Promise<Prisma.BatchPayload>;
}
