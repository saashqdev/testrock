import { IEventsDb } from "@/db/interfaces/events/IEventsDb";
import { EventWithAttemptsDto, EventWithDetailsDto } from "@/db/models/events/EventsModel";
import { FiltersDto } from "@/lib/dtos/data/FiltersDto";
import { PaginationResultDto } from "@/lib/dtos/data/PaginationResultDto";
import RowFiltersHelper from "@/lib/helpers/RowFiltersHelper";
import { prisma } from "@/db/config/prisma/database";
import TenantModelHelper from "@/lib/helpers/models/TenantModelHelper";
import UserModelHelper from "@/lib/helpers/models/UserModelHelper";
export class EventsDbPrisma implements IEventsDb {
  async getEvents(
    pagination: { current: { page: number; pageSize: number }; filters: FiltersDto },
    tenantId?: string | null
  ): Promise<{
    items: EventWithAttemptsDto[];
    pagination: PaginationResultDto;
  }> {
    const whereFilters = RowFiltersHelper.getFiltersCondition(pagination.filters);
    const itemsRaw = await prisma.event.findMany({
      take: pagination.current.pageSize,
      skip: pagination.current.pageSize * (pagination.current.page - 1),
      where: {
        AND: [whereFilters, { tenantId }],
      },
      include: {
        tenant: { select: TenantModelHelper.selectSimpleTenantProperties },
        user: { select: UserModelHelper.selectSimpleUserProperties },
        // attempts: {
        //   select: {
        //     id: true,
        //     startedAt: true,
        //     finishedAt: true,
        //     endpoint: true,
        //     success: true,
        //     status: true,
        //     message: true,
        //   },
        // },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Map to EventWithAttemptsDto
    const items: EventWithAttemptsDto[] = itemsRaw.map((item) => ({
      ...item,
      tenant: item.tenant ?? null,
      user: item.user ?? null,
    }));
    const totalItems = await prisma.event.count({
      where: {
        tenantId,
        ...whereFilters,
      },
    });
    const totalPages = Math.ceil(totalItems / pagination.current.pageSize);

    return {
      items,
      pagination: {
        totalItems,
        totalPages,
        page: pagination.current.page,
        pageSize: pagination.current.pageSize,
        sortedBy: undefined,
        query: undefined,
      },
    };
  }

  async getEvent(id: string): Promise<EventWithDetailsDto | null> {
    const event = await prisma.event.findUnique({
      where: {
        id,
      },
      include: {
        tenant: { select: TenantModelHelper.selectSimpleTenantProperties },
        user: { select: UserModelHelper.selectSimpleUserProperties },
        // attempts: true,
      },
    });

    if (!event) return null;

    return {
      ...event,
      tenant: event.tenant ?? null,
      user: event.user ?? null,
    };
  }

  async createEvent(data: { tenantId: string | null; userId: string | null; name: string; data: string; description: string | null }) {
    return await prisma.event.create({
      data: {
        tenantId: data.tenantId,
        userId: data.userId,
        name: data.name,
        data: data.data,
        description: data.description,
      },
    });
  }
}
