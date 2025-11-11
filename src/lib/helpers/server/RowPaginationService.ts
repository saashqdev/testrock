import { Prisma } from "@prisma/client";
import { db } from "@/db";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { RowFiltersDto } from "@/lib/dtos/data/RowFiltersDto";
import { SortedByDto } from "@/lib/dtos/data/SortedByDto";
import { RowWithDetailsDto } from "@/db/models/entityBuilder/RowsModel";

export async function getRowsWithPagination({
  pageSize,
  page,
  entityId,
  entityName,
  tenantId,
  portalId,
  userId,
  sortedBy,
  filters,
  rowWhere,
  includePublic,
  orderBy,
}: {
  pageSize: number;
  page: number;
  entityId?: string;
  entityName?: string;
  tenantId?: string | null;
  portalId?: string | null;
  userId?: string | undefined;
  sortedBy?: SortedByDto[];
  filters?: RowFiltersDto;
  rowWhere?: Prisma.RowWhereInput;
  includePublic?: boolean;
  orderBy?: Prisma.RowOrderByWithRelationInput[];
}): Promise<{
  items: RowWithDetailsDto[];
  pagination: PaginationDto;
}> {
  if (!orderBy) {
    orderBy = [{ order: "desc" }, { createdAt: "desc" }];
  }

  let skip: number | undefined = pageSize * (page - 1);
  let take: number | undefined = pageSize;
  if (pageSize === -1) {
    skip = undefined;
    take = undefined;
  }
  const items = await db.rows.getRows({ entityId, entityName, tenantId, userId, take, skip, orderBy, filters, rowWhere, includePublic });
  const totalItems = await db.rows.countRows({ entityId, entityName, tenantId, userId, filters, rowWhere, includePublic });
  let totalPages = Math.ceil(totalItems / pageSize);
  if (pageSize === -1) {
    totalPages = 1;
  }

  return {
    items,
    pagination: {
      totalItems,
      totalPages,
      page,
      pageSize,
      sortedBy,
      query: undefined,
    },
  };
}
