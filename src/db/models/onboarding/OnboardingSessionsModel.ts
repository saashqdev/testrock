import {
  Onboarding,
  OnboardingSession,
  OnboardingFilter,
  OnboardingSessionStep,
  OnboardingStep,
  Tenant,
  OnboardingSessionAction,
  OnboardingSessionFilterMatch,
} from "@prisma/client";
import { UserDto } from "@/db/models/accounts/UsersModel";

export type OnboardingSessionsModel = {
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
};

export type OnboardingSessionWithDetailsDto = OnboardingSession & {
  onboarding: Onboarding;
  user: UserDto;
  tenant: Tenant | null;
  sessionSteps: (OnboardingSessionStep & {
    step: OnboardingStep;
  })[];
  actions: OnboardingSessionAction[];
  matches: (OnboardingSessionFilterMatch & { onboardingFilter: OnboardingFilter })[];
};
