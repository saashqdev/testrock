import { OnboardingSessionWithDetailsDto } from "@/db/models/onboarding/OnboardingSessionsModel";
import { PaginationDto } from "@/lib/dtos/PaginationDto";
import { Prisma } from "@prisma/client";

export interface IOnboardingSessionsDb {
  getOnboardingSessions({
    onboardingId,
    userId,
    tenantId,
    status,
    hasBeenStarted,
    hasBeenCompleted,
    hasBeenDismissed,
  }: {
    onboardingId?: string | undefined;
    userId?: string | undefined;
    tenantId?: string | null | undefined;
    status?: "active" | "started" | "dismissed" | "completed" | undefined;
    hasBeenStarted?: boolean | undefined;
    hasBeenCompleted?: boolean | undefined;
    hasBeenDismissed?: boolean | undefined;
  }): Promise<OnboardingSessionWithDetailsDto[]>;
  getOnboardingSessionsWithPagination({
    where,
    pagination,
  }: {
    where?: Prisma.OnboardingSessionWhereInput | undefined;
    pagination: {
      page: number;
      pageSize: number;
    };
  }): Promise<{
    items: OnboardingSessionWithDetailsDto[];
    pagination: PaginationDto;
  }>;
  getOnboardingSession(id: string): Promise<OnboardingSessionWithDetailsDto | null>;
  getOnboardingSessionsByUser({
    userId,
    tenantId,
    status,
  }: {
    userId: string;
    tenantId: string | null;
    status?: "active" | "started" | "dismissed" | "completed" | undefined;
  }): Promise<OnboardingSessionWithDetailsDto[]>;
  updateOnboardingSession(
    id: string,
    data: {
      status?: "active" | "started" | "dismissed" | "completed" | undefined;
      startedAt?: Date | undefined;
      completedAt?: Date | undefined;
      dismissedAt?: Date | undefined;
    }
  ): Promise<{
    onboardingId: string;
    userId: string;
    tenantId: string | null;
    status: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    startedAt: Date | null;
    completedAt: Date | null;
    dismissedAt: Date | null;
    createdRealtime: boolean;
  }>;
  setOnboardingSessionActions(
    id: string,
    data: {
      actions: {
        name: string;
        id: string;
        createdAt: Date;
        type: string;
        onboardingSessionId: string;
        value: string;
      }[];
    }
  ): Promise<Prisma.BatchPayload>;
  updateOnboardingSessions(
    ids: string[],
    data: {
      status?: "active" | "started" | "dismissed" | "completed" | undefined;
    }
  ): Promise<Prisma.BatchPayload>;
  deleteOnboardingSession(id: string): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    onboardingId: string;
    userId: string;
    tenantId: string | null;
    status: string;
    startedAt: Date | null;
    completedAt: Date | null;
    dismissedAt: Date | null;
    createdRealtime: boolean;
  }>;
  deleteOnboardingSessions(onboardingId: string): Promise<Prisma.BatchPayload>;
  groupOnboardingSessionsByUser(): Promise<
    (Prisma.PickEnumerable<Prisma.OnboardingSessionGroupByOutputType, "userId"[]> & {
      _count: {
        _all: number;
      };
    })[]
  >;
}
