import { Prisma } from "@prisma/client";

export interface IOnboardingSessionStepsDb {
  updateOnboardingSessionStep(
    id: string,
    data: {
      seenAt?: Date | undefined;
      completedAt?: Date | undefined;
    }
  ): Promise<{
    id: string;
    onboardingSessionId: string;
    stepId: string;
    seenAt: Date | null;
    completedAt: Date | null;
  }>;
  deleteOnboardingSessionSteps(ids: string[]): Promise<Prisma.BatchPayload>;
}
