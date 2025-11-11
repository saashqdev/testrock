import { AnalyticsEvent, FeatureFlag, FeatureFlagFilter } from "@prisma/client";

export type FeatureFlagsModel = {
  id: number;
  key: string;
  description: string;
  isActive: boolean;
};

export type FeatureFlagWithDetailsDto = FeatureFlag & {
  filters: FeatureFlagFilter[];
};

export type FeatureFlagWithEventsDto = FeatureFlagWithDetailsDto & {
  events: AnalyticsEvent[];
};
