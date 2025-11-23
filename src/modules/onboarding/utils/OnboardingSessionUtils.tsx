import { TFunction } from "i18next";
import { OnboardingSessionWithDetailsDto } from "@/db/models/onboarding/OnboardingSessionsModel";
import { OnboardingFilterMetadataDto } from "../dtos/OnboardingFilterMetadataDto";
import OnboardingFilterUtils from "./OnboardingFilterUtils";
import OnboardingStepUtils from "./OnboardingStepUtils";

export type OnboardingSessionActivityDto = {
  id: string;
  type: "created-manually" | "created-realtime" | "started" | "click" | "input" | "seen" | "dismissed" | "completed" | "step-seen" | "step-completed";
  createdAt: Date | null;
  description: string;
};
function getActivity({ t, item, metadata }: { t: TFunction; item: OnboardingSessionWithDetailsDto; metadata: OnboardingFilterMetadataDto }) {
  const items: OnboardingSessionActivityDto[] = [];
  let idCounter = 0;
  const matchingFilters = OnboardingFilterUtils.getStepMatches({ t, matches: item.matches, metadata })
    .map((f) => f.filter + (f.value ? `: ${f.value}` : ""))
    .join(", ");
  if (item.createdRealtime) {
    items.push({
      id: `${item.id}-${idCounter++}`,
      type: "created-realtime",
      createdAt: item.createdAt,
      description: `${t("onboarding.filter.matching")}: ${matchingFilters}`,
    });
  } else {
    items.push({
      id: `${item.id}-${idCounter++}`,
      type: "created-manually",
      createdAt: item.createdAt,
      description: "Matching filters: " + OnboardingFilterUtils.getStepMatches({ t, matches: item.matches, metadata }),
    });
  }
  if (item.startedAt) {
    items.push({ id: `${item.id}-${idCounter++}`, type: "started", createdAt: item.startedAt, description: "Started" });
  }
  if (item.dismissedAt) {
    items.push({ id: `${item.id}-${idCounter++}`, type: "dismissed", createdAt: item.dismissedAt, description: "Dismissed" });
  }
  if (item.completedAt) {
    items.push({ id: `${item.id}-${idCounter++}`, type: "completed", createdAt: item.completedAt, description: "Completed" });
  }

  item.actions.forEach((action) => {
    items.push({
      id: `${item.id}-${idCounter++}`,
      type: action.type as "click" | "input",
      createdAt: action.createdAt,
      description: "[" + action.name + "] " + action.value,
    });
  });

  item.sessionSteps.forEach((step) => {
    const stepBlock = OnboardingStepUtils.parseStepToBlock(step.step);
    if (step.seenAt) {
      items.push({
        id: `${item.id}-${idCounter++}`,
        type: "step-seen",
        createdAt: step.seenAt,
        description: `Step #${step.step.order} seen: ${stepBlock.title}`,
      });
    }
    if (step.completedAt) {
      items.push({
        id: `${item.id}-${idCounter++}`,
        type: "step-completed",
        createdAt: step.completedAt,
        description: `Step #${step.step.order} completed: ${stepBlock.title}`,
      });
    }
  });

  return items.sort((a, b) => {
    if (a.createdAt && b.createdAt) {
      return b.createdAt > a.createdAt ? 1 : -1;
    }
    return 1;
  });
}

export default {
  getActivity,
};
