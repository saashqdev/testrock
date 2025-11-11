import { FiltersDto } from "@/lib/dtos/data/FiltersDto";
import { PaginationResultDto } from "@/lib/dtos/data/PaginationResultDto";
import { EventWithAttemptsDto, EventWithDetailsDto } from "@/db/models/events/EventsModel";

export interface IEventsDb {
  getEvents(
    pagination: {
      current: {
        page: number;
        pageSize: number;
      };
      filters: FiltersDto;
    },
    tenantId?: string | null
  ): Promise<{
    items: EventWithAttemptsDto[];
    pagination: PaginationResultDto;
  }>;
  getEvent(id: string): Promise<EventWithDetailsDto | null>;
  createEvent(data: { tenantId: string | null; userId: string | null; name: string; data: string; description: string | null }): Promise<{
    name: string;
    id: string;
    createdAt: Date;
    tenantId: string | null;
    userId: string | null;
    data: string;
    resource: string | null;
    description: string | null;
  }>;
}
