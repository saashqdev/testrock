import { Prisma, Onboarding, OnboardingFilter } from "@prisma/client";
import { OnboardingWithDetailsDto } from "@/db/models/onboarding/OnboardingModel";
import { PaginationDto } from "@/lib/dtos/PaginationDto";
import { OnboardingSessionStatus } from "@/modules/onboarding/dtos/OnboardingSessionStatus";

export interface IOnboardingDb {
  getOnboardings({ active, realtime }: { active?: boolean | undefined; realtime?: boolean | undefined }): Promise<OnboardingWithDetailsDto[]>;
  getOnboardingsWithPagination({
    where,
    pagination,
  }: {
    where?: Prisma.OnboardingWhereInput | undefined;
    pagination: {
      page: number;
      pageSize: number;
    };
  }): Promise<{
    items: OnboardingWithDetailsDto[];
    pagination: PaginationDto;
  }>;
  getOnboarding(id: string): Promise<OnboardingWithDetailsDto | null>;
  createOnboarding(data: {
    title: string;
    type: "modal" | "page";
    active: boolean;
    realtime: boolean;
    canBeDismissed: boolean;
    height: string;
    filters: {
      type:
        | "admin.portal"
        | "user.is"
        | "user.language"
        | "user.firstName.notSet"
        | "user.lastName.notSet"
        | "user.avatar.notSet"
        | "user.roles.contains"
        | "user.roles.notContains"
        | "tenant.portal"
        | "tenant.is"
        | "tenant.members.hasOne"
        | "tenant.members.hasMany"
        | "tenant.subscription.products.has"
        | "tenant.subscription.active"
        | "tenant.subscription.inactive"
        | "tenant.api.used"
        | "tenant.api.notUsed"
        | "tenant.user.entity.hasCreated"
        | "tenant.user.entity.hasNotCreated";
      value: string | null;
    }[];
    steps: {
      order: number;
      block: string;
    }[];
  }): Promise<Onboarding>;
  updateOnboarding(
    id: string,
    data: {
      title?: string | undefined;
      type?: "modal" | "page" | undefined;
      realtime?: boolean | undefined;
      active?: boolean | undefined;
      canBeDismissed?: boolean | undefined;
      height?: string | undefined;
      filters?:
        | {
            type:
              | "admin.portal"
              | "user.is"
              | "user.language"
              | "user.firstName.notSet"
              | "user.lastName.notSet"
              | "user.avatar.notSet"
              | "user.roles.contains"
              | "user.roles.notContains"
              | "tenant.portal"
              | "tenant.is"
              | "tenant.members.hasOne"
              | "tenant.members.hasMany"
              | "tenant.subscription.products.has"
              | "tenant.subscription.active"
              | "tenant.user.entity.hasNotCreated"
              | "tenant.api.used"
              | "tenant.api.notUsed"
              | "tenant.user.entity.hasCreated";
            value: string | null;
          }[]
        | undefined;
      steps?:
        | {
            order: number;
            block: string;
          }[]
        | undefined;
    }
  ): Promise<Onboarding | null>;
  setOnboardingManualSessions(
    id: string,
    data: {
      userId: string;
      tenantId: string | null;
      status: "active" | "started" | "dismissed" | "completed";
    }[]
  ): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    type: string;
    realtime: boolean;
    active: boolean;
    canBeDismissed: boolean;
    height: string | null;
  }>;
  createOnboardingSession(
    onboarding: OnboardingWithDetailsDto,
    session: {
      userId: string;
      tenantId: string | null;
      status: OnboardingSessionStatus;
      matchingFilters: OnboardingFilter[];
      createdRealtime: boolean;
    }
  ): Promise<{
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
  deleteOnboarding(id: string): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    type: string;
    realtime: boolean;
    active: boolean;
    canBeDismissed: boolean;
    height: string | null;
  }>;
}
