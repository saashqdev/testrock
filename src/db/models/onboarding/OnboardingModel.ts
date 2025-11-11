import { Onboarding, OnboardingFilter, OnboardingStep, OnboardingSession } from "@prisma/client";

export type OnboardingModel = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    type: string;
    realtime: boolean;
    active: boolean;
    canBeDismissed: boolean;
    height: string | null;
}

export type OnboardingWithDetailsDto = Onboarding & {
  filters: OnboardingFilter[];
  steps: OnboardingStep[];
  sessions: OnboardingSession[];
};
