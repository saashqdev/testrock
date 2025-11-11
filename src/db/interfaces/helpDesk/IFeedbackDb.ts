import { FiltersDto } from "@/lib/dtos/data/FiltersDto";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { FeedbackWithDetailsDto } from "@/db/models/helpDesk/FeedbackModel";
export interface IFeedbackDb {
  getAllFeedback({
    filters,
    filterableProperties,
    pagination,
  }: {
    filters: FiltersDto;
    filterableProperties: FilterablePropertyDto[];
    pagination: {
      pageSize: number;
      page: number;
    };
  }): Promise<{
    items: FeedbackWithDetailsDto[];
    pagination: PaginationDto;
  }>;

  createFeedback(data: { tenantId: string | null; userId: string | null; message: string; fromUrl: string }): Promise<{
    id: string;
    createdAt: Date;
    tenantId: string | null;
    userId: string | null;
    message: string;
    fromUrl: string;
  }>;
}
