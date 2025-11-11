import { RowCommentWithDetailsDto } from "@/db/models/entityBuilder/RowCommentsModel";

export interface IRowCommentsDb {
  getRowComments(rowId: string): Promise<RowCommentWithDetailsDto[]>;
  getRowComment(id: string): Promise<RowCommentWithDetailsDto | null>;
  createRowComment(data: { createdByUserId: string; rowId: string; value: string }): Promise<{
    id: string;
    createdAt: Date;
    createdByUserId: string;
    rowId: string;
    value: string;
    isDeleted: boolean | null;
  }>;
  updateRowComment(
    id: string,
    data: {
      value?: string | undefined;
      isDeleted?: boolean | undefined;
    }
  ): Promise<{
    id: string;
    createdAt: Date;
    createdByUserId: string;
    rowId: string;
    value: string;
    isDeleted: boolean | null;
  }>;
  deleteRowComment(id: string): Promise<{
    id: string;
    createdAt: Date;
    createdByUserId: string;
    rowId: string;
    value: string;
    isDeleted: boolean | null;
  }>;
}
