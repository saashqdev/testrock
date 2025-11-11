import { IOnboardingSessionStepsDb } from "@/db/interfaces/onboarding/IOnboardingSessionStepsDb";
import { prisma } from "@/db/config/prisma/database";
export class OnboardingSessionStepsDbPrisma implements IOnboardingSessionStepsDb {
  async updateOnboardingSessionStep(id: string, data: { seenAt?: Date; completedAt?: Date }) {
    return await prisma.onboardingSessionStep.update({
      where: { id },
      data,
    });
  }

  async deleteOnboardingSessionSteps(ids: string[]) {
    return await prisma.onboardingSessionStep.deleteMany({
      where: { id: { in: ids } },
    });
  }
}
