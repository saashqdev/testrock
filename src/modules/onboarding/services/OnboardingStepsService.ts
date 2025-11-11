import { TFunction } from "i18next";
import { OnboardingBlockDto } from "../blocks/OnboardingBlockUtils";
import { OnboardingWithDetailsDto } from "@/db/models/onboarding/OnboardingModel";
import { db } from "@/db";

async function setSteps({ item, form, t }: { item: OnboardingWithDetailsDto; form: FormData; t: TFunction }) {
  const block: OnboardingBlockDto = JSON.parse(form.get("block")?.toString() ?? "{}");
  if (!block) {
    return Response.json({ error: t("shared.invalidForm") }, { status: 400 });
  }
  await db.onboarding.updateOnboarding(item.id, {
    type: block.style as "modal" | "page",
    height: block.height,
    canBeDismissed: block.canBeDismissed,
    steps: block.steps.map((f, idx) => {
      return { order: idx + 1, block: JSON.stringify(f) };
    }),
  });
  await db.onboardingSessions.deleteOnboardingSessions(item.id);
}
export default {
  setSteps,
};
