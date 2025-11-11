import { IOnboardingDb } from "@/db/interfaces/onboarding/IOnboardingDb";
import { prisma } from "@/db/config/prisma/database";
import { OnboardingWithDetailsDto } from "@/db/models/onboarding/OnboardingModel";
import { Onboarding, Prisma } from "@prisma/client";
import { PaginationDto } from "@/lib/dtos/PaginationDto";
import { OnboardingFilterType } from "@/modules/onboarding/dtos/OnboardingFilterTypes";
import { OnboardingSessionStatus } from "@/modules/onboarding/dtos/OnboardingSessionStatus";
import { OnboardingFilter } from "@prisma/client";

export class OnboardingDbPrisma implements IOnboardingDb {
  async getOnboardings({ active, realtime }: { active?: boolean; realtime?: boolean }): Promise<OnboardingWithDetailsDto[]> {
    return await prisma.onboarding.findMany({
      where: { active, realtime },
      include: { filters: { orderBy: { createdAt: "asc" } }, steps: { orderBy: { order: "asc" } }, sessions: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async getOnboardingsWithPagination({
    where,
    pagination,
  }: {
    where?: Prisma.OnboardingWhereInput;
    pagination: { page: number; pageSize: number };
  }): Promise<{ items: OnboardingWithDetailsDto[]; pagination: PaginationDto }> {
    const items = await prisma.onboarding.findMany({
      where,
      take: pagination.pageSize,
      skip: (pagination.page - 1) * pagination.pageSize,
      include: { filters: { orderBy: { createdAt: "asc" } }, steps: { orderBy: { order: "asc" } }, sessions: true },
      orderBy: { createdAt: "desc" },
    });
    const totalItems = await prisma.onboarding.count({
      where,
    });
    return {
      items,
      pagination: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pagination.pageSize),
      },
    };
  }

  async getOnboarding(id: string): Promise<OnboardingWithDetailsDto | null> {
    return await prisma.onboarding.findUnique({
      where: { id },
      include: { filters: { orderBy: { createdAt: "asc" } }, steps: { orderBy: { order: "asc" } }, sessions: true },
    });
  }

  async createOnboarding(data: {
    title: string;
    type: "modal" | "page";
    active: boolean;
    realtime: boolean;
    canBeDismissed: boolean;
    height: string;
    filters: { type: OnboardingFilterType; value: string | null }[];
    steps: { order: number; block: string }[];
  }): Promise<Onboarding> {
    return await prisma.onboarding.create({
      data: {
        title: data.title,
        type: data.type.toString(),
        active: data.active,
        realtime: data.realtime,
        canBeDismissed: data.canBeDismissed,
        height: data.height,
        filters: { create: data.filters },
        steps: { create: data.steps },
      },
    });
  }

  async updateOnboarding(
    id: string,
    data: {
      title?: string;
      type?: "modal" | "page";
      realtime?: boolean;
      active?: boolean;
      canBeDismissed?: boolean;
      height?: string;
      filters?: {
        type: OnboardingFilterType;
        value: string | null;
      }[];
      steps?: { order: number; block: string }[];
    }
  ): Promise<Onboarding> {
    const update: Prisma.OnboardingUpdateInput = {
      title: data.title,
      type: data.type?.toString(),
      realtime: data.realtime,
      active: data.active,
      canBeDismissed: data.canBeDismissed,
      height: data.height,
    };
    if (data.filters) {
      update.filters = {
        deleteMany: {},
        create: data.filters,
      };
    }
    if (data.steps) {
      update.steps = {
        deleteMany: {},
        create: data.steps,
      };
    }
    return await prisma.onboarding.update({
      where: { id },
      data: update,
    });
  }

  async setOnboardingManualSessions(id: string, data: { userId: string; tenantId: string | null; status: OnboardingSessionStatus }[]): Promise<Onboarding> {
    const update: Prisma.OnboardingUpdateInput = {
      sessions: {
        deleteMany: {},
        create: data,
      },
    };
    return await prisma.onboarding.update({
      where: { id },
      data: update,
    });
  }

  async createOnboardingSession(
    onboarding: OnboardingWithDetailsDto,
    session: { userId: string; tenantId: string | null; status: OnboardingSessionStatus; matchingFilters: OnboardingFilter[]; createdRealtime: boolean }
  ) {
    return await prisma.onboardingSession.create({
      data: {
        onboardingId: onboarding.id,
        userId: session.userId,
        tenantId: session.tenantId,
        status: session.status,
        createdRealtime: session.createdRealtime,
        sessionSteps: {
          create: onboarding.steps.map((step) => ({
            stepId: step.id,
          })),
        },
        matches: {
          create: session.matchingFilters.map((filter) => ({
            onboardingFilterId: filter.id,
          })),
        },
      },
    });
  }

  async deleteOnboarding(id: string): Promise<Onboarding> {
    return await prisma.onboarding.delete({
      where: { id },
    });
  }
}
