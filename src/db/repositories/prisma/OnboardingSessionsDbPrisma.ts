import { IOnboardingSessionsDb } from "@/db/interfaces/onboarding/IOnboardingSessionsDb";
import { prisma } from "@/db/config/prisma/database";
import { Prisma, OnboardingSessionAction } from "@prisma/client";
import { OnboardingSessionWithDetailsDto } from "@/db/models/onboarding/OnboardingSessionsModel";
import { PaginationDto } from "@/lib/dtos/PaginationDto";
import { OnboardingSessionStatus } from "@/modules/onboarding/dtos/OnboardingSessionStatus";

export class OnboardingSessionsDbPrisma implements IOnboardingSessionsDb {
  async getOnboardingSessions({
    onboardingId,
    userId,
    tenantId,
    status,
    hasBeenStarted,
    hasBeenCompleted,
    hasBeenDismissed,
  }: {
    onboardingId?: string;
    userId?: string;
    tenantId?: string | null;
    status?: OnboardingSessionStatus;
    hasBeenStarted?: boolean;
    hasBeenCompleted?: boolean;
    hasBeenDismissed?: boolean;
  }): Promise<OnboardingSessionWithDetailsDto[]> {
    const where: Prisma.OnboardingSessionWhereInput = {
      onboardingId,
      userId,
      tenantId,
      status: status ? status.toString() : undefined,
    };
    if (hasBeenStarted !== undefined) {
      where.startedAt = hasBeenStarted ? { not: null } : null;
    }
    if (hasBeenCompleted !== undefined) {
      where.completedAt = hasBeenCompleted ? { not: null } : null;
    }
    if (hasBeenDismissed !== undefined) {
      where.dismissedAt = hasBeenDismissed ? { not: null } : null;
    }
    return await prisma.onboardingSession.findMany({
      where,
      include: {
        onboarding: true,
        user: { include: { admin: true } },
        tenant: true,
        sessionSteps: { include: { step: true }, orderBy: { step: { order: "asc" } } },
        actions: true,
        matches: { include: { onboardingFilter: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getOnboardingSessionsWithPagination({
    where,
    pagination,
  }: {
    where?: Prisma.OnboardingSessionWhereInput;
    pagination: { page: number; pageSize: number };
  }): Promise<{ items: OnboardingSessionWithDetailsDto[]; pagination: PaginationDto }> {
    const items = await prisma.onboardingSession.findMany({
      where,
      take: pagination.pageSize,
      skip: (pagination.page - 1) * pagination.pageSize,
      include: {
        onboarding: true,
        user: { include: { admin: true } },
        tenant: true,
        sessionSteps: { include: { step: true }, orderBy: { step: { order: "asc" } } },
        actions: true,
        matches: { include: { onboardingFilter: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    const totalItems = await prisma.onboardingSession.count({
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

  async getOnboardingSession(id: string): Promise<OnboardingSessionWithDetailsDto | null> {
    return await prisma.onboardingSession.findUnique({
      where: { id },
      include: {
        onboarding: true,
        user: { include: { admin: true } },
        tenant: true,
        sessionSteps: { include: { step: true }, orderBy: { step: { order: "asc" } } },
        actions: true,
        matches: { include: { onboardingFilter: true } },
      },
    });
  }

  async getOnboardingSessionsByUser({
    userId,
    tenantId,
    status,
  }: {
    userId: string;
    tenantId: string | null;
    status?: OnboardingSessionStatus;
  }): Promise<OnboardingSessionWithDetailsDto[]> {
    return await prisma.onboardingSession.findMany({
      where: { userId, tenantId, status },
      include: {
        onboarding: true,
        user: { include: { admin: true } },
        tenant: true,
        sessionSteps: { include: { step: true }, orderBy: { step: { order: "asc" } } },
        actions: true,
        matches: { include: { onboardingFilter: true } },
      },
      orderBy: { onboarding: { createdAt: "asc" } },
    });
  }

  async updateOnboardingSession(id: string, data: { status?: OnboardingSessionStatus; startedAt?: Date; completedAt?: Date; dismissedAt?: Date }) {
    return await prisma.onboardingSession.update({
      where: { id },
      data,
    });
  }

  async setOnboardingSessionActions(id: string, data: { actions: OnboardingSessionAction[] }) {
    await prisma.onboardingSessionAction.deleteMany({
      where: { onboardingSessionId: id },
    });
    return await prisma.onboardingSessionAction.createMany({
      data: data.actions.map((action) => ({
        onboardingSessionId: id,
        type: action.type.toString(),
        name: action.name,
        value: action.value,
        createdAt: action.createdAt,
      })),
    });
  }

  async updateOnboardingSessions(ids: string[], data: { status?: OnboardingSessionStatus }) {
    return await prisma.onboardingSession.updateMany({
      where: { id: { in: ids } },
      data,
    });
  }

  async deleteOnboardingSession(id: string) {
    return await prisma.onboardingSession.delete({
      where: { id },
    });
  }

  async deleteOnboardingSessions(onboardingId: string) {
    return await prisma.onboardingSession.deleteMany({
      where: { onboardingId },
    });
  }

  async groupOnboardingSessionsByUser() {
    return await prisma.onboardingSession.groupBy({
      by: ["userId"],
      _count: {
        _all: true,
      },
    });
  }
}
