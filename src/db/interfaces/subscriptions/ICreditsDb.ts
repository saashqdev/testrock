import { FilterablePropertyDto } from "@/lib/dtos/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/PaginationDto";
import { FiltersDto } from "@/lib/dtos/data/FiltersDto";
import { CreditsWithDetailsDto } from "@/db/models/subscriptions/CreditsModel";
import { Prisma } from "@prisma/client";
export interface ICreditsDb {
  getAllCredits({
    tenantId,
    filters,
    filterableProperties,
    pagination,
  }: {
    tenantId: string | null;
    filters: FiltersDto;
    filterableProperties: FilterablePropertyDto[];
    pagination: { pageSize: number; page: number };
  }): Promise<{
    items: CreditsWithDetailsDto[];
    pagination: PaginationDto;
  }>;
  createCredit(data: {
    tenantId: string;
    userId: string | null;
    type: string;
    objectId: string | null;
    amount: number;
  }): Promise<{ tenantId: string; id: string; createdAt: Date; userId: string | null; amount: number; type: string; objectId: string | null }>;
  deleteCredits(ids: string[]): Promise<Prisma.BatchPayload>;
  sumAmount(filters: {
    tenantId: string;
    createdAt?:
      | {
          gte: Date;
          lt: Date;
        }
      | undefined;
  }): Promise<number>;
}
